// src/components/User/UserSettingsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth-service';
import type { UpdateModel } from '../../api';

import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';

interface UserFormData {
  username: string; // не редактируем, но храним
  email: string;    // не редактируем, но храним
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  avatarFile?: File | null;
}

export const UserSettingsPage: React.FC = () => {
  const { user, refreshUser, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    avatarFile: null,
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // blob для локального превью
  const [avatarVersion, setAvatarVersion] = useState(0); // cache-buster для imageUri
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        email: user.email || '',
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        avatarFile: null,
      });

      // при приходе нового user обнуляем локальное превью
      setAvatarPreview(null);
      // imageUri не меняется, поэтому полагаемся на avatarVersion
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatarFile: file }));
      setAvatarPreview(URL.createObjectURL(file)); // показываем выбранный файл до сохранения
    }
  };

  const handleAvatarUpload = async () => {
    if (!formData.avatarFile) return;

    setAvatarUploading(true);
    try {
      await authService.editAvatar(formData.avatarFile);
      await refreshUser();

      setFormData(prev => ({ ...prev, avatarFile: null }));
      setAvatarPreview(null);         // переходим обратно на src из imageUri
      setAvatarVersion(v => v + 1);   // ломаем кеш браузера

      setSnackbar({
        open: true,
        message: 'Аватар успешно обновлён',
        severity: 'success',
      });
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: 'Ошибка загрузки аватара',
        severity: 'error',
      });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const profileData: UpdateModel = {
        username: user.name || '',
        firstName: formData.firstName || undefined,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
      };

      await authService.editUser(profileData);
      await refreshUser();

      setSnackbar({
        open: true,
        message: 'Профиль успешно обновлён',
        severity: 'success',
      });
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: 'Ошибка сохранения профиля',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography align="center">Загрузка...</Typography>
      </Container>
    );
  }

  // src для аватара:
  // 1) если есть локальный blob (avatarPreview) — показываем его
  // 2) иначе, если есть imageUri — добавляем ?v=avatarVersion для обхода кеша
  const avatarSrc =
    avatarPreview ??
    (user.imageUri ? `${user.imageUri}?v=${avatarVersion}` : undefined);

  return (
    <Container maxWidth="md">
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 4, fontWeight: 700 }}
      >
        Настройки профиля
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={isMdUp ? 'row' : 'column'}
          spacing={4}
          alignItems="flex-start"
        >
          {/* Левая колонка – аватар */}
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              width: isMdUp ? 220 : '100%',
            }}
          >
            <Avatar
              src={avatarSrc}
              sx={{
                width: 140,
                height: 140,
                bgcolor: 'grey.300',
                fontSize: 64,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={handleAvatarClick}
            >
              {!avatarSrc &&
                (user.firstName?.[0] ||
                  user.name?.[0] ||
                  user.email?.[0] ||
                  'U'
                ).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Нажмите на аватар, чтобы выбрать фото
            </Typography>
            <input
              ref={fileInputRef}
              hidden
              accept="image/*"
              type="file"
              onChange={handleAvatarChange}
            />
            {formData.avatarFile && (
              <Button
                variant="contained"
                startIcon={
                  avatarUploading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleAvatarUpload}
                disabled={avatarUploading}
              >
                {avatarUploading ? 'Загрузка...' : 'Сохранить аватар'}
              </Button>
            )}
          </Box>

          {/* Правая колонка – форма (без логина и email) */}
          <Box component="form" sx={{ flexGrow: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={isLoading}
              />
              <TextField
                label="Отчество"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={isLoading}
              />
              <TextField
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={isLoading}
              />
              <TextField
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={isLoading}
              />

              <Box>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};
