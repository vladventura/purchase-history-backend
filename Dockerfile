FROM node:10.23.0-alpine3.9

RUN echo "Copying directories"
COPY ./ .

RUN echo "Installing backend dependencies"
RUN npm ci

EXPOSE $PORT

ENTRYPOINT ["sh", "./entrypoint.sh"]