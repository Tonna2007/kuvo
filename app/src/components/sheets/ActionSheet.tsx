import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Archive,
  Camera,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  MapPin,
  Settings,
  Star,
  Trash2,
  UserRound,
  Users,
  VolumeX,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { fonts, radii, spacing, useColors } from '../../theme';
import type { SheetIcon } from '../../types';

const iconMap: Record<SheetIcon, typeof Users> = {
  group: Users,
  star: Star,
  settings: Settings,
  contact: UserRound,
  mute: VolumeX,
  trash: Trash2,
  exit: LogOut,
  photo: ImageIcon,
  camera: Camera,
  doc: FileText,
  pin: MapPin,
  lock: Lock,
  archive: Archive,
};

export function ActionSheet() {
  const { sheet, closeSheet, handleSheetItem } = useApp();
  const colors = useColors();

  return (
    <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={closeSheet}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.textDark }]}>{sheet?.title}</Text>
          {sheet?.items.map((item) => {
            const Icon = iconMap[item.icon];
            const danger = item.danger;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSheetItem(item.id)}
                style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: danger ? colors.dangerBg : colors.card },
                  ]}
                >
                  <Icon size={17} color={danger ? colors.danger : colors.green} strokeWidth={2} />
                </View>
                <Text style={[styles.label, { color: danger ? colors.danger : colors.textDark }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={closeSheet}
            style={({ pressed }) => [
              styles.cancel,
              { backgroundColor: colors.card },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.cancelLabel, { color: colors.textDark }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,20,13,0.45)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: 8,
    paddingBottom: 22,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E4DE',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 15,
    color: '#1E1E1C',
    fontWeight: '600',
    paddingHorizontal: spacing.xl,
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: {
    backgroundColor: '#FBE9E7',
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: '#1E1E1C',
  },
  labelDanger: {
    color: '#C0392B',
  },
  cancel: {
    marginTop: 8,
    marginHorizontal: spacing.xl,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F1',
    borderRadius: radii.lg,
  },
  cancelLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: '#1E1E1C',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
