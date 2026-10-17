import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import { Card, Badge, StatCard, ListRow, SectionHeader, ProgressBar, IconTile } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, shadow } from '../../theme/theme';

function HeaderAvatar({ name }) {
  const initials = (name || 'M')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');
  return (
    <View style={styles.headerAvatar}>
      <Text style={styles.headerAvatarText}>{initials}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, activeProfile, tributes, dataLoading, refreshData, switchProfile } = useApp();
  const ready = tributes.filter((t) => t.status === 'ready').length;
  const rendering = tributes.filter((t) => t.status === 'rendering');
  const withQR = tributes.filter((t) => t.hasQR).length;
  const first = user?.name?.split(' ')[0] || 'there';

  return (
    <Screen
      eyebrow="Welcome back"
      title={`Hello, ${first}`}
      subtitle={`Remembering ${activeProfile?.displayName || 'your loved one'}`}
      onRefresh={refreshData}
      refreshing={dataLoading}
      lead={<HeaderAvatar name={user?.name} />}
    >
      <View style={styles.statsRow}>
        <StatCard icon="film" value={tributes.length} label="Tributes" />
        <StatCard icon="check" value={ready} label="Ready" />
        <StatCard icon="qr" value={withQR} label="QR Codes" />
      </View>

      {rendering.length > 0 && (
        <Card style={styles.renderCard}>
          <View style={styles.renderHead}>
            <IconTile name="sparkle" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.renderTitle}>In progress</Text>
              <Text style={styles.renderSub}>
                {rendering.length} tribute{rendering.length > 1 ? 's' : ''} still generating
              </Text>
            </View>
            <Badge label="Rendering" tone="warning" />
          </View>
          {rendering.map((t) => (
            <View key={t.id} style={styles.renderItem}>
              <View style={styles.renderItemTop}>
                <Text style={styles.renderName}>{t.name}</Text>
                <Text style={styles.renderPct}>{Math.round((t.progress || 0.4) * 100)}%</Text>
              </View>
              <ProgressBar value={t.progress || 0.4} tone="warning" height={7} />
            </View>
          ))}
        </Card>
      )}

      <SectionHeader eyebrow="Do more" title="Quick actions" style={{ marginTop: spacing.lg }} />

      <View style={styles.actions}>
        <ListRow
          icon="film"
          iconTone="brand"
          title="Create a video tribute"
          desc="Turn a life story into a heartfelt AI video."
          onPress={() => navigation.navigate('Tributes', { screen: 'CreateTribute' })}
        />
        <ListRow
          icon="qr"
          title="Manage QR codes"
          desc="Mint and link Legacy QR codes to tributes."
          onPress={() => navigation.navigate('QR')}
        />
        <ListRow
          icon="play"
          title="Preview the viewer"
          desc="See what visitors experience when they scan."
          onPress={() => navigation.navigate('Viewer')}
        />
        <ListRow
          icon="user"
          title="Switch memorial profile"
          desc="Choose another deceased loved one under this family account."
          onPress={switchProfile}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: colors.onPrimary, fontSize: 19, fontWeight: '800', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },

  renderCard: { marginTop: spacing.lg, gap: spacing.md },
  renderHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  renderTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  renderSub: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  renderItem: { gap: 7 },
  renderItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  renderName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  renderPct: { fontSize: 13, fontWeight: '700', color: colors.warning },

  actions: { gap: spacing.sm },
});
