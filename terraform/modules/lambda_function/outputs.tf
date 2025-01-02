output "function_arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.lambdas.arn
}

output "function_name" {
  description = "The name of the Lambda function"
  value       = aws_lambda_function.lambdas.function_name
}

output "lambda_execution_role_arn" {
  description = "The ARN of the IAM role used by the Lambda function"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "lambda_execution_role_name" {
  description = "The name of the IAM role used by the Lambda function"
  value       = aws_iam_role.lambda_execution_role.name
}

output "invoke_arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.lambdas.invoke_arn
}
