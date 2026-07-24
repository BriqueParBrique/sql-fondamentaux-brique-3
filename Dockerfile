# Managed by BriqueParBrique/nouvelle-brique — do not edit in brick repos
FROM ruby:3.3-slim

# build-essential : compilation des gems natives.
# libcurl4 : requis à l'exécution par html-proofer (via ethon/typhoeus), sinon
#            `bundle exec htmlproofer` échoue sur « Could not open library libcurl ».
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libcurl4 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/jekyll

# Gemfile.lock est versionné : on l'installe tel quel pour que le conteneur
# résolve exactement les mêmes versions que la CI. Les gems vivent hors de
# /srv/jekyll pour survivre au montage du volume de travail.
ENV BUNDLE_PATH=/usr/local/bundle
COPY Gemfile Gemfile.lock ./
RUN bundle install

EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload", "--force_polling"]
