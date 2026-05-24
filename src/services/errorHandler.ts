import Toast from 'react-native-toast-message';
import { ApiError } from './api-error';

export function handleError(error: unknown) {

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        Toast.show({
          type: 'error',
          text1: 'Dados inválidos',
          text2: error.message, 
        });
        return;
      
      case 401:
        Toast.show({
          type: 'error',
          text1: 'Sessão expirada',
          text2: error.message,
        });
        return;

      default:
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: error.message,
        });
        return;
    }
  }

  Toast.show({
    type: 'error',
    text1: 'Erro inesperado',
    text2: 'Algo deu errado',
  });
}