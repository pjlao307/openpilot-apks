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
  TextInput,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { formatSize } from '../../utils/bytes';

import X from '../../themes';
import Styles from './CommunityForksStyle';
import { Params } from '../../config';

const DEBUG = false;

const ForkRoutes = {
    PRIMARY: 'PRIMARY',
    FORKDETAILS: 'DETAILS',
    ADD_REPO_MODAL: 'ADD_REPO_MODAL',
}

class CommunityForks extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
          repos: [],
          config: {},
          updateAvailable: false,
          jsonLoaded: false,
          isLoading: false,
          newHash: '',
          route: ForkRoutes.PRIMARY,
        }
    }

    async componentDidMount() {
        cached = await ChffrPlus.readParam(Params.KEY_COMMUNITYPILOT_CONFIG);

        //this.setState({status: "loaded1: "+cached.toString()})
        let config = JSON.parse(cached) || [];
        this.setState({
          repos: config.repos,
          isLoading: true,
          config: config,
          status: "loaded2: "+cached
        })

        // Check to see if there's an update to the apk
        config_url = config.config_url;

        fetch(config_url)
          .then((response) => response.json())
          .then((responseJson) => {
            updateAvailable = true;
            if (config.apk_hash === responseJson.apk_hash) {
              updateAvailable = false;
            }
            this.setState({
              isLoading: false,
              jsonLoaded: true,
              newHash: responseJson.apk_hash,
              updateAvailable: updateAvailable,
            });

             // Cache this data to storage
            //ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(responseJson));
          })
          .catch((error) => {
            this.setState({
              isLoading: false,
              jsonLoaded: false,
              status: 'No connection'
            })
          });
    }

    handleNavigatedFromMenu(name, user, branch, route) {
        const thisRepo = {name: name, user: user, branch: branch};
        this.setState({ selectedRepo: thisRepo, name: name, user: user, branch: branch, route: route })
        this.refs.forkScrollView.scrollTo({ x: 0, y: 0, animated: false })
    }

    handlePressedBack() {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS");
        this.props.openSettings();
    }

    addRepo() {
      const {config, repos} = this.state;
      const newRepo = {name: this.state.name,user: this.state.user,branch: this.state.branch};

      try {
        newRepos = [...repos, newRepo];
        newConfig = config;
        newConfig.repos = newRepos;
        this.setState({repos: newRepos, route: ForkRoutes.PRIMARY});
        ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(newConfig));
      }
      catch (error) {
        //this.setState({repos: [newRepo], route: ForkRoutes.PRIMARY});
      }
    }

    deleteRepo() {
      const {selectedRepo, config, repos} = this.state;

      let newList = repos.filter(item =>
          item.name != selectedRepo.name ||
          item.user != selectedRepo.user ||
          item.branch != selectedRepo.branch
      );

      newConfig = config;
      newConfig.repos = newList;

      ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(newConfig));
      this.setState({repos: newList, route: ForkRoutes.PRIMARY});
    }

    doUpdate(config, newHash) {
      config.apk_hash = newHash;
      ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(config));
      this.setState({status: "Updating APK: "+JSON.stringify(config.apk_url)})
      Alert.alert('Updating APK', 'Downloading update... please wait.\nYour EON will reboot once download has completed.', [
      ]);
      this.props.doUpdate();
    }

    renderAddRepo() {
      return (
         <X.Gradient color='dark_blue'>
           <View style={ Styles.viewHeader }>
             <X.Button
                color='ghost'
                size='small'
                onPress={ () => this.setState({route: ForkRoutes.PRIMARY}) }>
                {'<  Back'}
              </X.Button>
           </View>
           <ScrollView
             ref="addRepoScrollView"
             style={ Styles.viewWindow }>
             <View color='darkBlue' style={ Styles.viewContainer }>
               <TextInput
                style={Styles.textInput}
                placeholder="GitHub Username"
                placeholderTextColor="#444444"
                maxLength={30}
                onChangeText={(user) => this.setState({user})}
                underlineColorAndroid="transparent"
                />
                <TextInput
                 style={Styles.textInput}
                 placeholder="Repository Name"
                 placeholderTextColor="#444444"
                 maxLength={30}
                 onChangeText={(name) => this.setState({name: name})}
                 underlineColorAndroid="transparent"
                 />
                <TextInput
                 style={Styles.textInput}
                 placeholder="Branch"
                 placeholderTextColor="#444444"
                 maxLength={60}
                 onChangeText={(branch) => this.setState({branch})}
                 underlineColorAndroid="transparent"
                 />
                 <X.Button
                     size='small'
                     color='setupPrimary'
                     style={{width: 200, marginTop: 10, marginLeft: 15}}
                     onPress={ () => this.addRepo() }>
                     Add Repository
                 </X.Button>
               </View>
            </ScrollView>
         </X.Gradient>
       )
    }

    renderLoadBtn() {
        return (
          <X.Button
              size='small'
              color='setupPrimary'
              style={Styles.Btn200}
              onPress={ () => this.props.loadRepo(this.state.user,this.state.name,this.state.branch) }>
              Load this repo
          </X.Button>
        )
    }

    renderDeleteBtn() {
        return (
          <X.Button
              size='small'
              color='setupPrimary'
              style={Styles.Btn200}
              onPress={ () => this.deleteRepo() }>
              DELETE this repo
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
                 onPress={ () => this.handleNavigatedFromMenu(this.state.name, this.state.user, this.state.branch, ForkRoutes.PRIMARY) }>
                 {'<  Back'}
               </X.Button>
             </View>
             <ScrollView
               ref="forkScrollView"
               style={ Styles.viewWindow }>
               <View>
                 <X.Text color='white' weight='bold' style={ Styles.communityForkHeader }>
                   Github User: {this.state.user}
                 </X.Text>
                 <X.Text color='white' weight='light' style={ Styles.communityForkHeader }>
                   Repo: {this.state.name}
                 </X.Text>
                 <X.Text color='white' weight='light' style={ Styles.forkDescription }>
                   Branch: {this.state.branch}
                 </X.Text>
                 <View style={ Styles.installBtn }>
                   {this.renderLoadBtn()}
                 </View>
                 <View style={ Styles.installBtn }>
                   {this.renderDeleteBtn()}
                 </View>
               </View>
             </ScrollView>
           </View>
        </X.Gradient>
      );
    }

    renderUpdateBtn() {
      if (this.state.updateAvailable) {
        return (
            <X.Button
               size='small'
               color='updateAvailable'
               style={Styles.updateBtnView}
               onPress={ () => this.doUpdate(this.state.config, this.state.newHash) }>
               Update Available
             </X.Button>
        )
      }

      return
    }

    renderPrimaryScreen() {
      const { isLoading, status, repos } = this.state;

      if (isLoading) {
        return (
          <ActivityIndicator size="large" color="#0000ff" animating={isLoading} />
        );
      }

      let debug = (
        <X.Text
          color='white' weight='light'
          style={ Styles.communityForkContext }>
        </X.Text>
      )

      if (DEBUG) {
        debug = (
          <X.Text
            color='white' weight='light'
            style={ Styles.communityForkContext }>
            Debug: {status}
          </X.Text>
        )
      }

      try {
        contents = repos.map((item) =>{
          return (
            <View>
              <X.Button
                  size='small'
                  color='settingsDefault'
                  style={Styles.updateBtn}
                  onPress={ () => this.handleNavigatedFromMenu(item.name, item.user, item.branch, ForkRoutes.FORKDETAILS) }>
                  {item.user+" "+item.name+" ("+item.branch+")"}
              </X.Button>
              <X.Line color='transparent' size='tiny' spacing='mini' />
            </View>
          )
        });
      } catch (error) {
        this.setStatus({status: "repos.map error: "+error.toString()})
      }

      try {
        updateBtn = this.renderUpdateBtn()
      }
      catch (error) {
        this.setStatus({status: "updateBtn error: "+error.toString()})
      }


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
                  <Bold>Step 1:</Bold> Make sure you've cloned the fork you'd like to manage from this list onto your EON via SSH.
                    Name the directory for the clone in the format "openpilot.[username]".  For example, to clone comma.ai's
                    official repository so that you can switch to it from this GUI you would use the following SSH command:
                    'git clone https://github.com/commaai/openpilot.git /data/openpilot.commaai'
                </X.Text>
                <X.Text
                  color='white' weight='light'
                  style={ Styles.communityForkContext }>
                  <Bold>Step 2:</Bold> Tap the "Add Repository" button and add the repo information to manage.
                  Make sure you spell <Bold>everything correctly</Bold>.  Any typos will cause this to not work.
                  The branch name you specify when you added the repository will automatically be checked out
                  when you switch to that fork.
                </X.Text>
                <X.Text
                  color='white' weight='light'
                  style={ Styles.communityForkContext }>
                  <Bold>Step 3:</Bold> Tap the repository you'd like to switch to.
                </X.Text>
                <X.Text
                  color='white' weight='light'
                  style={ Styles.communityForkContext }>
                  <Bold>Step 4:</Bold> Tap "Load this repo" button to switch to that fork.
                </X.Text>
                <X.Text
                  color='white' weight='light'
                  style={ Styles.communityForkContext }>
                  Your EON will automatically reboot into the fork and branch you selected.
                </X.Text>

                <View style={Styles.addRepoBtnView}>
                  {updateBtn}

                  <X.Button
                      size='small'
                      color='setupPrimary'
                      style={Styles.Btn200}
                      onPress={ () => this.setState({route: ForkRoutes.ADD_REPO_MODAL}) }>
                      Add Repository
                  </X.Button>

                </View>

                <X.Table color='darkBlue'>
                  {contents}
                </X.Table>

                {debug}

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
            case ForkRoutes.ADD_REPO_MODAL:
                return this.renderAddRepo();
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
});

const mapDispatchToProps = dispatch => ({
    openSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'Settings' }));
    },
    loadRepo: (username,reponame,branch) => {
      ChffrPlus.loadCommunityPilotRepo(username,reponame,branch);
      Alert.alert('Switching Repo', ' Your EON will reboot automatically.', [
      ]);
    },
    doUpdate: () => {
      ChffrPlus.updateCommunityPilotAPK();
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForks);
