// outputs.tf

# All API Gateway related outputs have been removed

output "api_gateway_url_generate_pdf" {
  description = "URL of the API Gateway for generate-pdf"
  value       = "${aws_api_gateway_deployment.generate_pdf.invoke_url}/generate-pdf"
}
