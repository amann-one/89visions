import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryChips } from '@/components/bucket/category-chips';
import { PhotoStrip, type StripPhoto } from '@/components/bucket/photo-strip';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseGermanDate, isoDateToGermanInput } from '@/lib/format';
import { STATUSES, type CategoryId, type ItemInput, type ItemPhoto, type ItemStatus } from '@/lib/models';
import {
  addPhoto,
  createItem,
  deletePhoto,
  fetchItem,
  fetchPhotos,
  updateItem,
} from '@/lib/repository';
import { Alert } from '@/lib/alert';
import { deleteStoragePhoto, uploadItemPhoto } from '@/lib/storage';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<CategoryId>('travel');
  const [status, setStatus] = useState<ItemStatus>('idea');
  const [dateText, setDateText] = useState('');
  const [place, setPlace] = useState('');
  const [costText, setCostText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [existingPhotos, setExistingPhotos] = useState<ItemPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<StripPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const [item, photos] = await Promise.all([fetchItem(id), fetchPhotos(id)]);
        if (!active || !item) {
          if (active) {
            Alert.alert('Nicht gefunden', 'Dieses Ziel existiert nicht mehr.');
            router.back();
          }
          return;
        }
        setTitle(item.title);
        setNote(item.note ?? '');
        setCategory(item.category);
        setStatus(item.status);
        setDateText(isoDateToGermanInput(item.targetDate));
        setPlace(item.placeName ?? '');
        setCostText(item.costTarget === null ? '' : String(item.costTarget));
        setSavedText(item.costSaved > 0 ? String(item.costSaved) : '');
        setRating(item.rating);
        setIsFavorite(item.isFavorite);
        setExistingPhotos(photos);
      } catch (cause) {
        Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Ziel konnte nicht geladen werden.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const visibleExisting = useMemo(
    () => existingPhotos.filter((photo) => !removedPhotoIds.includes(photo.id)),
    [existingPhotos, removedPhotoIds]
  );

  const stripPhotos: StripPhoto[] = useMemo(
    () => [
      ...visibleExisting.map((photo) => ({ id: photo.id, uri: photo.thumbUrl })),
      ...newPhotos,
    ],
    [visibleExisting, newPhotos]
  );

  const parsedDate = dateText.trim() ? parseGermanDate(dateText) : null;
  const dateInvalid = dateText.trim().length > 0 && parsedDate === null;

  const removePhoto = (photoId: string) => {
    if (newPhotos.some((photo) => photo.id === photoId)) {
      setNewPhotos((current) => current.filter((photo) => photo.id !== photoId));
    } else {
      setRemovedPhotoIds((current) => [...current, photoId]);
    }
  };

  const appendAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    setNewPhotos((current) => [
      ...current,
      ...assets.map((asset) => ({ id: randomUUID(), uri: asset.uri })),
    ]);
  };

  const pickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Berechtigung nötig', 'Bitte erlaube den Zugriff auf deine Fotos in den Einstellungen.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 8,
        quality: 0.9,
      });
      if (!result.canceled) {
        appendAssets(result.assets);
      }
    } catch (cause) {
      Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Fotos konnten nicht geöffnet werden.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Berechtigung nötig', 'Bitte erlaube den Zugriff auf die Kamera in den Einstellungen.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
      if (!result.canceled) {
        appendAssets(result.assets);
      }
    } catch (cause) {
      Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Kamera konnte nicht geöffnet werden.');
    }
  };

  const save = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert('Titel fehlt', 'Gib deinem Ziel einen Namen.');
      return;
    }
    if (dateInvalid) {
      Alert.alert('Datum ungültig', 'Bitte nutze das Format TT.MM.JJJJ, zum Beispiel 14.08.2026.');
      return;
    }

    const costTarget = costText.trim() ? Number(costText.replace(',', '.')) : null;
    const costSaved = savedText.trim() ? Number(savedText.replace(',', '.')) : 0;
    if (costTarget !== null && (!Number.isFinite(costTarget) || costTarget < 0)) {
      Alert.alert('Budget ungültig', 'Bitte gib einen Betrag in Euro an.');
      return;
    }

    const input: ItemInput = {
      title: cleanTitle,
      note: note.trim() ? note.trim() : null,
      category,
      status,
      targetDate: parsedDate,
      placeName: place.trim() ? place.trim() : null,
      costTarget,
      costSaved: Number.isFinite(costSaved) && costSaved > 0 ? costSaved : 0,
      rating: status === 'done' ? rating : null,
      isFavorite,
    };

    const targetId = id ?? randomUUID();
    setSaving(true);
    try {
      if (id) {
        await updateItem(id, input);
      } else {
        await createItem(targetId, input);
      }

      for (let index = 0; index < newPhotos.length; index += 1) {
        setUploadLabel(`Foto ${index + 1} von ${newPhotos.length} wird hochgeladen…`);
        const uploaded = await uploadItemPhoto(newPhotos[index].uri, targetId);
        await addPhoto({
          id: randomUUID(),
          itemId: targetId,
          url: uploaded.url,
          thumbUrl: uploaded.thumbUrl,
          storagePath: uploaded.storagePath,
          width: uploaded.width,
          height: uploaded.height,
          createdAt: new Date().toISOString(),
        });
      }

      const removed = existingPhotos.filter((photo) => removedPhotoIds.includes(photo.id));
      for (const photo of removed) {
        await deletePhoto(photo.id);
        await deleteStoragePhoto(photo.storagePath);
      }

      router.back();
    } catch (cause) {
      Alert.alert(
        'Gespeichert – aber nicht ganz',
        `Das Ziel wurde gesichert. Beim Foto-Upload gab es ein Problem:\n\n${
          cause instanceof Error ? cause.message : 'Unbekannter Fehler'
        }`
      );
      router.back();
    } finally {
      setSaving(false);
      setUploadLabel('');
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={[styles.container, styles.column]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, borderBottomColor: theme.border },
        ]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <ThemedText type="default" themeColor="textSecondary">
            Abbrechen
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>{id ? 'Ziel bearbeiten' : 'Neues Ziel'}</ThemedText>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field label="Was willst du erleben?">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="z. B. Polarlichter sehen"
            placeholderTextColor={theme.textSecondary}
            style={[...inputStyle, styles.titleInput]}
            autoFocus={!id}
            maxLength={120}
            returnKeyType="next"
          />
        </Field>

        <Field label="Kategorie">
          <CategoryChips value={category} onChange={(next) => next && setCategory(next)} includeAll={false} />
        </Field>

        <Field label="Status">
          <View style={styles.segment}>
            {STATUSES.map((entry) => {
              const selected = entry.id === status;
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => setStatus(entry.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.segmentItem,
                    {
                      backgroundColor: selected ? theme.accent : theme.backgroundElement,
                      borderColor: selected ? theme.accent : theme.border,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: selected ? '#FFFFFF' : theme.textSecondary }}>
                    {entry.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {status === 'done' && (
          <Field label="Wie war es?">
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setRating(rating === value ? null : value)}
                  hitSlop={8}
                  accessibilityLabel={`${value} von 5 Sternen`}>
                  <ThemedText
                    style={[
                      styles.star,
                      { color: rating !== null && value <= rating ? '#E0A100' : theme.border },
                    ]}>
                    ★
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Field>
        )}

        <Field label="Zieltermin" hint="Format TT.MM.JJJJ – optional">
          <TextInput
            value={dateText}
            onChangeText={setDateText}
            placeholder="14.08.2026"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numbers-and-punctuation"
            style={[...inputStyle, dateInvalid && { borderColor: theme.accent }]}
            maxLength={10}
          />
          {dateInvalid && (
            <ThemedText type="small" style={{ color: theme.accent }}>
              Bitte als TT.MM.JJJJ eingeben.
            </ThemedText>
          )}
        </Field>

        <Field label="Ort">
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder="z. B. Reykjavík, Island"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
            maxLength={120}
          />
        </Field>

        <View style={styles.row}>
          <Field label="Budget (€)" style={styles.rowItem}>
            <TextInput
              value={costText}
              onChangeText={setCostText}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={inputStyle}
            />
          </Field>
          <Field label="Schon gespart (€)" style={styles.rowItem}>
            <TextInput
              value={savedText}
              onChangeText={setSavedText}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={inputStyle}
            />
          </Field>
        </View>

        <Field label="Notiz">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Warum steht das auf deiner Liste?"
            placeholderTextColor={theme.textSecondary}
            style={[...inputStyle, styles.noteInput]}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
        </Field>

        <Field label="Fotos">
          <PhotoStrip
            photos={stripPhotos}
            onAdd={() => void pickFromLibrary()}
            onRemove={removePhoto}
          />
          <View style={styles.photoActions}>
            <Pressable onPress={() => void takePhoto()} style={styles.photoAction}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                📷 Foto aufnehmen
              </ThemedText>
            </Pressable>
            <ThemedText type="small" themeColor="textSecondary">
              Bilder werden automatisch verkleinert.
            </ThemedText>
          </View>
        </Field>

        <Pressable
          onPress={() => setIsFavorite((current) => !current)}
          accessibilityRole="switch"
          accessibilityState={{ checked: isFavorite }}
          style={[
            styles.favoriteRow,
            { borderColor: theme.border, backgroundColor: theme.backgroundElement },
          ]}>
          <View style={styles.favoriteText}>
            <ThemedText type="smallBold">Als Favorit markieren</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Favoriten stehen weiter oben in deiner Liste.
            </ThemedText>
          </View>
          <Switch
            value={isFavorite}
            onValueChange={setIsFavorite}
            trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
            thumbColor={Platform.OS === 'android' ? theme.background : undefined}
          />
        </Pressable>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.two,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}>
        {uploadLabel.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.uploadLabel}>
            {uploadLabel}
          </ThemedText>
        )}
        <Button
          label={id ? 'Änderungen speichern' : 'Ziel hinzufügen'}
          onPress={() => void save()}
          loading={saving}
          disabled={saving}
        />
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  hint,
  children,
  style,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  style?: object;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>{label}</ThemedText>
        {hint && (
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>{hint}</ThemedText>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  content: {
    padding: 20,
    gap: Spacing.four,
  },
  scroll: {
    flex: 1,
  },
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 11,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
  },
  titleInput: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    minHeight: 58,
  },
  noteInput: {
    minHeight: 110,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stars: {
    flexDirection: 'row',
    gap: 10,
  },
  star: {
    fontSize: 34,
    lineHeight: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  photoActions: {
    gap: 4,
    marginTop: 2,
  },
  photoAction: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  favoriteText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  uploadLabel: {
    textAlign: 'center',
  },
});
