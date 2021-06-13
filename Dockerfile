FROM gcr.io/cloud-builders/gcloud:latest

COPY ./ .

RUN gcloud app deploy