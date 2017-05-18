FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY app /usr/src/app

WORKDIR /usr/src/app/


RUN ["npm","install"]
RUN ["npm","run","buildserver"]
ENTRYPOINT ["npm","run","startserver"]
EXPOSE 8090