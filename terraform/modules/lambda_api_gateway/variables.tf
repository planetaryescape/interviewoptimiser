variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "api_gateway_name" {
  type        = string
  description = "Name of the API Gateway"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda function"
}

variable "lambda_function_invoke_arn" {
  type        = string
  description = "Invoke ARN of the Lambda function"
}
