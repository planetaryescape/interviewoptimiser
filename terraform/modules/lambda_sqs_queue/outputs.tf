output "sqs_queue_url" {
  value = aws_sqs_queue.sqs_queue.url
}

output "dlq_url" {
  value = aws_sqs_queue.dlq.url
}
