/** Representa la estructura JSON que responde el servidor en errores 4xx / 5xx */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}