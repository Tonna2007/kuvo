import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { useApp } from '../../context/AppContext';
import { LOCALES, t } from '../../i18n';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, radii, spacing, useColors } from '../../theme';

export function LanguageScreen({ navigation }: RootScreenProps<'Language'>) {
  const { language, setLanguage } = useApp();
  const colors = useColors();

  return (
    <Screen>
      <SubscreenHeader title={t('language.title')} onBack={() => navigation.goBack()} />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t('language.hint')}
      </Text>
      {LOCALES.map((item) => {
        const on = language === item.code;
        return (
          <Pressable
            key={item.code}
            onPress={() => setLanguage(item.code)}
            style={[styles.row, { borderBottomColor: colors.border }]}
          >
            <View>
              <Text style={[styles.name, { color: colors.textDark }]}>{item.native}</Text>
              <Text style={[styles.sub, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
            <View style={[styles.check, { borderColor: on ? colors.green : colors.border, backgroundColor: on ? colors.green : 'transparent' }]}>
              {on ? <Text style={styles.mark}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
