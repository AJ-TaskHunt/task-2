export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  result: T;
}
