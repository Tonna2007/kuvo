import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, Phone, Plus, UserRound, Users, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { fonts, useColors } from '../../theme';

type Action = 'chat' | 'group' | 'call' | 'you';

type Props = {
  onAction: (action: Action) => void;
};

export function FabMenu({ onAction }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  void language;
  const [open, setOpen] = useState(false);

  const items: { id: Action; label: string; Icon: typeof Plus }[] = [
    { id: 'chat', label: t('fab.chat'), Icon: MessageCircle },
    { id: 'group', label: t('fab.group'), Icon: Users },
    { id: 'call', label: t('fab.call'), Icon: Phone },
    { id: 'you', label: t('fab.you'), Icon: UserRound },
  ];

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: 18 + Math.max(insets.bottom, 8) }]}>
      {open
        ? items.map((item) => {
            const Icon = item.Icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setOpen(false);
                  onAction(item.id);
                }}
                style={[styles.row]}
              >
                <Text style={[styles.label, { color: colors.textDark, backgroundColor: colors.surface }]}>
                  {item.label}
                </Text>
                <View style={[styles.mini, { backgroundColor: colors.green }]}>
                  <Icon size={16} color={colors.white} strokeWidth={2.2} />
                </View>
              </Pressable>
            );
          })
        : null}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[styles.plus, { backgroundColor: colors.gold }]}
      >
        {open ? (
          <X size={22} color={colors.greenDarker} strokeWidth={2.4} />
        ) : (
          <Plus size={26} color={colors.greenDarker} strokeWidth={2.4} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 18,
    alignItems: 'flex-end',
    gap: 10,
  },
  plus: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 12.5,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  mini: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
