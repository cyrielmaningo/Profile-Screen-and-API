// Tiny fetch wrapper with JSON handling and error throwing.
import { API_BASE_URL } from './config';
import * as FileSystem from 'expo-file-system/legacy';

async function parseResponse(res) {
  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      `Request failed with status ${res.status}`;

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Perform a JSON request against the Memento API.
 * @param {string} path Path beginning with "/" (e.g. "/tributes").
 * @param {object} [opts] fetch options ({ method, body, headers }).
 * @returns {Promise<any>} Parsed JSON response, or null for 204 No Content.
 * @throws {Error} When the response status is not 2xx.
 */
export async function request(path, opts = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
  } = opts;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  return parseResponse(res);
}

/**
 * Upload a video selected through Expo ImagePicker.
 * Uses Expo FileSystem multipart upload instead of React Native FormData
 * to avoid "Unsupported FormDataPart implementation".
 */
export async function uploadVideo(file) {
  if (!file?.uri) {
    throw new Error('Choose a video before uploading.');
  }

  try {
    const result = await FileSystem.uploadAsync(
      `${API_BASE_URL}/media/video`,
      file.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'video',
        mimeType: file.mimeType || 'video/mp4',
        parameters: {},
      }
    );

    let data = null;

    try {
      data = result.body ? JSON.parse(result.body) : null;
    } catch {
      data = result.body;
    }

    if (result.status < 200 || result.status >= 300) {
      throw new Error(
        data?.error ||
        `Video upload failed with status ${result.status}`
      );
    }

    return data;
  } catch (error) {
    console.error('Video upload error:', error);

    throw new Error(
      error?.message ||
      'Unable to upload this video.'
    );
  }
}

export const get = (path) =>
  request(path, { method: 'GET' });

export const post = (path, body) =>
  request(path, {
    method: 'POST',
    body,
  });

export const patch = (path, body) =>
  request(path, {
    method: 'PATCH',
    body,
  });

export const del = (path) =>
  request(path, {
    method: 'DELETE',
  });