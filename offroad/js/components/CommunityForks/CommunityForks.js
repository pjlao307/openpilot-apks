import React, { Component } from 'react';
import {
  View,
  ScrollView,
  WebView,
  Alert,
  StyleSheet,
  FlatList,
  List,
  ActivityIndicator,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { formatSize } from '../../utils/bytes';

import X from '../../themes';
import Styles from './CommunityForksStyle';
import { Params } from '../../config';

import {
    loadCommunityPilotRepo,
} from '../../store/params/actions';

import { loadCommunityPilotConfig } from '../../utils/version';

const ForkRoutes = {
    PRIMARY: 'PRIMARY',
    FORKDETAILS: 'DETAILS',
}

class CommunityForks extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
          isLoading: false,
          repos: [],
          isConnected: false,
          cachedConfig: [],
          checkRepoResponse: null,
          route: ForkRoutes.PRIMARY,
        }
    }

    componentDidMount() {
        const url = "http://192.168.2.17/react/test.json";

        cached = ChffrPlus.readParam(Params.KEY_COMMUNITYPILOT_CONFIG);

        this.setState({isLoading: true});

        fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {
            this.setState({
              repos: responseJson.repos,
              isLoading: false,
              isConnected: true,
              status: 'Loading json'
            });

            // Cache this data to storage
            ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(responseJson));
          })
          .catch((error) => {
            let config = JSON.parse(cached._55);
            this.setState({
              isLoading: false,
              cachedConfig: cached,
              repos: config.repos,
              isConnected: false,
              status: 'No connection, using cache'
            })
        });
    }

    handleNavigatedFromMenu(name, user, desc, route) {
        this.setState({ forkname: name, user: user, description: desc, route: route })
        this.refs.forkScrollView.scrollTo({ x: 0, y: 0, animated: false })
    }

    handlePressedBack() {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS");
        this.props.openSettings();
    }

    renderBtn() {

        btnLabel = 'Load this fork';
        if (this.state.user === 'commaai') {
          btnLabel = 'Load openpilot';
        }

        return (
          <X.Button
              size='small'
              color='setupPrimary'
              style={{width: 200, marginTop: 20}}
              onPress={ () => this.props.loadRepo(this.state.user) }>
              {btnLabel}
          </X.Button>
        )
    }

    renderForkDetails() {
      return (
        <X.Gradient color='dark_blue'>
          <View color='darkBlue' style={ Styles.viewContainer }>
            <View style={ Styles.viewHeader }>
              <X.Button
                 color='ghost'
                 size='small'
                 onPress={ () => this.handleNavigatedFromMenu(this.state.forkname, this.state.user, this.state.description, ForkRoutes.PRIMARY) }>
                 {'<  Back'}
               </X.Button>
             </View>
             <ScrollView
               ref="forkScrollView"
               style={ Styles.viewWindow }>
               <View>
                 <X.Text color='white' weight='bold' style={ Styles.communityForkHeader }>
                   {this.state.forkname}
                 </X.Text>
                 <X.Text color='white' weight='light' style={ Styles.forkDescription }>
                   {this.state.description}
                 </X.Text>
                 <View style={ Styles.installBtn }>
                   {this.renderBtn('load')}
                 </View>
               </View>
             </ScrollView>
           </View>
        </X.Gradient>
      );
    }

    getRepos() {
      if (!this.state.isConnected)  {
        // ChffrPlus.readParam returns some funky JSON structure
        // so we have to find the object with our data in it

        cachedItems = Object.entries(this.state.cachedConfig).map(([key,value]) => {
            //let jsonData = [];
            //jsonData = JSON.parse(value);
            return (
              <View>
                <X.Text color='white' weight='light' style={ {paddingBottom:20} }>
                  Key: {key}
                </X.Text>
                <X.Text color='white' weight='light' style={ {paddingBottom:20} }>
                  Value: {value}
                </X.Text>
              </View>
            )
        })

        return cachedItems;

      }

      return null;
    }

    renderPrimaryScreen() {
      const { isLoading, repos } = this.state;

      if (isLoading) {
        return (
          <ActivityIndicator size="large" color="#0000ff" animating={this.state.isLoading} />
        );
      }

      contents = repos.map((item) =>{
        return (
          <View>
            <X.Button
                size='small'
                color='settingsDefault'
                onPress={ () => this.handleNavigatedFromMenu(item.name, item.user, item.desc, ForkRoutes.FORKDETAILS) }>
                {item.name}
            </X.Button>
            <X.Line color='transparent' size='tiny' spacing='mini' />
          </View>
        )
      });

      const Bold = (props) => <X.Text color='white' weight='bold'>{props.children}</X.Text>

      return (
         <X.Gradient color='dark_blue'>
           <View color='darkBlue' style={ Styles.viewContainer }>
             <View style={ Styles.viewHeader }>
                <X.Button
                    color='ghost'
                    size='small'
                    onPress={ () => this.handlePressedBack() }>
                    {'<  CommunityPilot Forks'}
                </X.Button>
              </View>
              <ScrollView
                ref="forkScrollView"
                style={ Styles.viewWindow }>
                <X.Text
                  size='medium' color='white' weight='bold'
                  style={ Styles.headline }>
                  Welcome to CommunityPilot Forks
                </X.Text>
                <X.Text
                  color='white' weight='light'
                  style={ Styles.communityForkContext }>
                  You can load any fork listed below.  Simply click on the fork
                  you would like to view details on and tap "Load this fork".  Your
                  EON will clone that fork if it hasn't already and configure that
                  fork then reboot.  If the fork has already been cloned
                  it will switch to that fork on reboot.
                </X.Text>

                <X.Table color='darkBlue'>
                  {contents}
                </X.Table>
              </ScrollView>
            </View>
        </X.Gradient>
      );
    }

    renderScreenByRoute() {
        const { route } = this.state;
        switch (route) {
            case ForkRoutes.FORKDETAILS:
                return this.renderForkDetails();
            default:
              return this.renderPrimaryScreen();
        }
    }

    render() {
        return (
            <X.Gradient color='dark_blue'>
                { this.renderScreenByRoute() }
            </X.Gradient>
        )
    }
}

const mapStateToProps = state => ({
    simState: state.host.simState,
    wifiState: state.host.wifiState,
    checkRepoResponse: state.host.checkRepoResponse,
});

const mapDispatchToProps = dispatch => ({
    openSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'Settings' }));
    },
    loadRepo: (username) => {
      ChffrPlus.loadCommunityPilotRepo(username);
      Alert.alert('Loading', 'Switching repositories.  If the repository needs to be cloned DO NOT shut off the EON.  Your EON will reboot automatically after cloning has finished.', [
          { text: 'OK', onPress: () => {}, style: 'cancel' },
      ]);
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForks);
