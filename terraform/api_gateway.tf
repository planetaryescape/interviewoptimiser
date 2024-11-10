# Create API Gateway v2 (HTTP API)
resource "aws_apigatewayv2_api" "main" {
  name          = "${local.project_name}-api"
  protocol_type = "HTTP"
}

# Create API Gateway v2 stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

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

# API Gateway v1 (REST API) for generate-pdf
resource "aws_api_gateway_rest_api" "generate_pdf" {
  name = "${local.project_name}-generate-pdf-api"
}

resource "aws_api_gateway_resource" "generate_pdf" {
  rest_api_id = aws_api_gateway_rest_api.generate_pdf.id
  parent_id   = aws_api_gateway_rest_api.generate_pdf.root_resource_id
  path_part   = "generate-pdf"
}

resource "aws_api_gateway_method" "generate_pdf" {
  rest_api_id   = aws_api_gateway_rest_api.generate_pdf.id
  resource_id   = aws_api_gateway_resource.generate_pdf.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "generate_pdf" {
  rest_api_id = aws_api_gateway_rest_api.generate_pdf.id
  resource_id = aws_api_gateway_resource.generate_pdf.id
  http_method = aws_api_gateway_method.generate_pdf.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_pdf.invoke_arn
}

resource "aws_api_gateway_deployment" "generate_pdf" {
  depends_on = [aws_api_gateway_integration.generate_pdf]

  rest_api_id = aws_api_gateway_rest_api.generate_pdf.id
  stage_name  = "prod"
}

# Create CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.main.name}"

  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "api_gw_generate_pdf" {
  name = "/aws/api_gw/${aws_api_gateway_rest_api.generate_pdf.name}"

  retention_in_days = 30
}
