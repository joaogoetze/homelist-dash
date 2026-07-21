import Toast from 'react-native-toast-message';
import { ApiError } from './api-error';

export function handleError(error: unknown) {

  console.log("Erro", error);

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
          text1: 'Erro de autenticação',
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

  if (error instanceof TypeError && error.message === 'Network request failed') {
    Toast.show({
      type: 'error',
      text1: 'Sem conexão',
      text2: 'Verifique sua internet e tente novamente.',
    });
    return;
  }

  Toast.show({
    type: 'error',
    text1: 'Erro inesperado',
    text2: 'Algo deu errado',
  });
}