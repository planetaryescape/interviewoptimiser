# Add CloudWatch Log Group for Lambda function
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 14

  tags = {
    Function = var.function_name
    Project  = var.project_name
  }

  # Prevent recreation of automatically created log groups
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      # Ignore changes to tags, e.g. because a management agent
      # updates these based on some ruleset managed elsewhere.
      tags,
    ]
  }
}
