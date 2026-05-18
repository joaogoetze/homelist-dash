import Toast from 'react-native-toast-message';
import { ApiError } from './api-error';

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: error.message,
    });
    return;
  }

  Toast.show({
    type: 'error',
    text1: 'Erro inesperado',
    text2: 'Algo deu errado',
  });

  console.error(error);
}