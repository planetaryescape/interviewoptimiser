# Create API Gateway v2 (HTTP API)
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "${var.project_name}-${var.api_gateway_name}"
  protocol_type = "HTTP"
}

# Create API Gateway v2 stage
resource "aws_apigatewayv2_stage" "api_gateway_stage" {
  api_id      = aws_apigatewayv2_api.api_gateway.id
  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

# Create API Gateway v2 integration for add-to-queue
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id = aws_apigatewayv2_api.api_gateway.id

  integration_uri    = var.lambda_function_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# Create API Gateway v2 route for add-to-queue
resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "POST /${var.lambda_function_name}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}
