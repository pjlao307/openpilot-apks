FROM ubuntu:16.04

RUN apt-get update && apt-get install -y curl unzip git build-essential make pkg-config wget dh-autoreconf

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y openjdk-8-jdk openjdk-8-jre android-sdk nodejs yarn

WORKDIR /tmp

ENV ANDROID_HOME=/usr/lib/android-sdk
ENV PATH="$PATH:/usr/lib/android-sdk/tools/bin"

# install Android SDK Tools
RUN curl -o sdk-tools.zip "https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip" && \
    unzip -o sdk-tools.zip -d "/usr/lib/android-sdk/" && \
    chmod +x /usr/lib/android-sdk/tools/bin/*

RUN yes | sdkmanager "platform-tools" "platforms;android-23" "platforms;android-27" "extras;android;m2repository" "extras;google;m2repository"

# install capnpc-java
RUN apt-get install -y libcapnp-dev
RUN git clone https://github.com/capnproto/capnproto-java.git && cd capnproto-java && make && cp capnpc-java /usr/local/bin/

# clone public openpilot and build cereal
RUN git clone https://github.com/commaai/openpilot.git --depth=1 && mkdir /tmp/openpilot/apks
RUN /tmp/openpilot/phonelibs/install_capnp.sh
RUN cd /tmp/openpilot/cereal && make

# apk time
WORKDIR /tmp/openpilot/apks

# need tools
COPY ./tools /tmp/openpilot/apks/tools

# copy files over
COPY ./black /tmp/openpilot/apks/black
COPY ./setup /tmp/openpilot/apks/setup
COPY ./frame /tmp/openpilot/apks/frame
COPY ./offroad /tmp/openpilot/apks/offroad

