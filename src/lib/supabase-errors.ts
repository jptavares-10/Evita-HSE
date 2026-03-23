const errorMap: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "E-mail não confirmado. Verifique sua caixa de entrada.",
  "User already registered": "Este e-mail já está cadastrado.",
  "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
  "Signup requires a valid password": "Informe uma senha válida.",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
  "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos antes de tentar novamente.",
};

export function translateSupabaseError(message: string): string {
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) return value;
  }
  return "Ocorreu um erro. Tente novamente.";
}
