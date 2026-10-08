/** Structure para respuestas exitosas del backend */
export interface ApiSuccessResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}