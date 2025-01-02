# Create CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.api_gateway.name}"

  retention_in_days = 30

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