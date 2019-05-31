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

import {
    loadCommunityPilotRepo,
} from '../../store/params/actions';

import { loadCommunityPilotConfig } from '../../utils/version';

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
          checkRepoResponse: null,
          route: ForkRoutes.PRIMARY,
        }
    }

    async componentDidMount() {
        cached = await ChffrPlus.readParam(Params.KEY_COMMUNITYPILOT_CONFIG);
        //this.setState({status: "loaded1: "+cached.toString()})
        let config = JSON.parse(cached) || [];
        this.setState({
          repos: config,
          status: "loaded2: "+config.toString()
        })
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
      const newRepo = {name: this.state.name,user: this.state.user,branch: this.state.branch};

      try {
        this.setState({repos: [...this.state.repos, newRepo], route: ForkRoutes.PRIMARY});
        ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify([...this.state.repos, newRepo]));
      }
      catch (error) {
        this.setState({repos: [newRepo], route: ForkRoutes.PRIMARY});
        //this.setState({status: "repo undefined: "+JSON.stringify([newRepo])});
      }
    }

    deleteRepo() {
      const {selectedRepo, repos} = this.state;

      let newList = repos.filter(item =>
          item.name != selectedRepo.name ||
          item.user != selectedRepo.user ||
          item.branch != selectedRepo.branch
      );

      ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(newList));
      this.setState({repos: newList, route: ForkRoutes.PRIMARY});
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
                 maxLength={30}
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

    renderPrimaryScreen() {
      const { status, repos } = this.state;

      try {
        contents = repos.map((item) =>{
          return (
            <View>
              <X.Button
                  size='small'
                  color='settingsDefault'
                  onPress={ () => this.handleNavigatedFromMenu(item.name, item.user, item.branch, ForkRoutes.FORKDETAILS) }>
                  {item.user+" "+item.name+" ("+item.branch+")"}
              </X.Button>
              <X.Line color='transparent' size='tiny' spacing='mini' />
            </View>
          )
        });
      } catch (error) {
        this.setStatus({status: "render error: "+error.toString()})
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
                  You can load any fork that you've added below.
                  Simply click on the fork
                  you would like to view details on and tap "Load this fork".  Your
                  EON will clone that fork if it hasn't already and configure that
                  fork then reboot.  If the fork has already been cloned
                  it will switch to that fork and reboot.
                </X.Text>

                <X.Table color='darkBlue'>
                  <View style={Styles.addRepoBtnView}>
                    <X.Button
                        size='small'
                        color='setupPrimary'
                        style={Styles.Btn200}
                        onPress={ () => this.setState({route: ForkRoutes.ADD_REPO_MODAL}) }>
                        Add Repository
                    </X.Button>
                  </View>
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
    simState: state.host.simState,
    wifiState: state.host.wifiState,
    checkRepoResponse: state.host.checkRepoResponse,
});

const mapDispatchToProps = dispatch => ({
    openSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'Settings' }));
    },
    loadRepo: (username,reponame,branch) => {
      ChffrPlus.loadCommunityPilotRepo(username,reponame,branch);
      Alert.alert('Switching Repo', 'If the repository needs to be cloned DO NOT shut off the EON.  Your EON will reboot automatically after cloning has finished.', [
      ]);
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForks);
