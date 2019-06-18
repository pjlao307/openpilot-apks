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
  Modal,
  Picker,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { formatSize } from '../../utils/bytes';

import X from '../../themes';
import Styles from './CommunityForksStyle';
import { Params } from '../../config';

const VERSION = 'v0.1.1';
const DEBUG = false;

const Icons = {
    user: require('../../img/icon_user.png'),
}

const ForkRoutes = {
    PRIMARY: 'PRIMARY',
    FORKDETAILS: 'DETAILS',
    ADD_REPO_MODAL: 'ADD_REPO_MODAL',
    ACCOUNT: 'ACCOUNT',
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
          status: '',
          newHash: '',
          route: ForkRoutes.PRIMARY,
          hasUpdate: '0',
          repoUpdated: false,
          updateRepoModalVisible: false,
          branches: [],
          selectedBranch: '',
          repoBranches: '',
          accountSet: false,
        }
    }

    async getRepoBranch(user) {
      branch = await ChffrPlus.callCommunityPilotScript('repobranch',user);
      jsonBranch = JSON.parse(branch)

      if (this.state.repoBranches.length === 0) {
        this.setState({repoBranches: '{"'+user+'": "'+jsonBranch[0]+'"'})
      }
      else {
        this.setState({repoBranches: this.state.repoBranches+','+'"'+user+'": "'+jsonBranch[0]+'"'})
      }
    }

    async componentDidMount() {
        cached = await ChffrPlus.readParam(Params.KEY_COMMUNITYPILOT_CONFIG);
        currentrepo = await ChffrPlus.getCurrentSymLink();
        response = await ChffrPlus.callCommunityPilotScript('currentbranch','');
        jsonResponse = JSON.parse(response)
        currentbranch = jsonResponse[0]
        userAccount = await ChffrPlus.readParam(Params.KEY_COMMUNITYPILOT_USER);

        try {
          jsonUserAccount = JSON.parse(userAccount)
          this.setState({discordUser: jsonUserAccount.username, email: jsonUserAccount.email, accountSet: true})
        }
        catch (error) {
        }

        let config = JSON.parse(cached) || [];
        let branches = [];
        // Get the currently loaded branch for each repo that's configured
        try {
          config.repos.map((item) => {
            this.getRepoBranch(item.user)
          })
        } catch (error) {
        }

        this.setState({
          repos: config.repos,
          isLoading: true,
          config: config,
          currentRepo: currentrepo,
          currentBranch: currentbranch,
          status: "loaded2: "+this.state.repoBranches
        })

        // Check to see if there's an update to the apk
        fetch(config.config_url)
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
          })
          .catch((error) => {
            this.setState({
              isLoading: false,
              jsonLoaded: false,
              status: 'No connection'
            })
          });
    }

    handleNavigatedFromMenu(user, route) {
        const thisRepo = {user: user};
        this.setState({ selectedRepo: thisRepo, user: user, route: route })
        this.refs.forkScrollView.scrollTo({ x: 0, y: 0, animated: false })
    }

    handlePressedBack() {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS");
        this.props.openSettings();
    }

    addRepo() {
      const {config, repos} = this.state;
      const newRepo = {name: this.state.name,user: this.state.user};

      try {
        newRepos = [...repos, newRepo];
        newConfig = config;
        newConfig.repos = newRepos;
        this.setState({repos: newRepos, route: ForkRoutes.PRIMARY});
        ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_CONFIG,JSON.stringify(newConfig));
      }
      catch (error) {
        this.setState({status: 'error adding repo: '+eror.toString()});
      }
    }

    deleteRepo() {
      const {selectedRepo, config, repos} = this.state;

      let newList = repos.filter(item =>
          item.user != selectedRepo.user
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
              onPress={ () => this.props.loadRepo(this.state.user,this.state.selectedBranch) }>
              Load this branch
          </X.Button>
        )
    }

    renderDeleteBtn() {
        return (
          <X.Button
              size='small'
              color='deleteRepo'
              style={Styles.Btn200}
              onPress={ () => this.deleteRepo() }>
              DELETE this repo
          </X.Button>
        )
    }

    async checkForUpdate(user) {
      response = await ChffrPlus.callCommunityPilotScript('repohasupdate', user);
      responseJson = JSON.parse(response)
      branches = await ChffrPlus.callCommunityPilotScript('getbranches', user);
      branchesJson = JSON.parse(branches)
      hasUpdate = responseJson[0]
      repobranch = await ChffrPlus.callCommunityPilotScript('repobranch',user);
      branchJson = JSON.parse(repobranch)
      currentbranch = branchJson[0]

      this.setState({hasUpdate: hasUpdate, branches: branchesJson, repoBranch: repobranch, selectedBranch: currentbranch})
    }

    async updateRepo() {
      updated = false
      this.setUpdateRepoModalVisible(true)
      response = await ChffrPlus.callCommunityPilotScript('updaterepo', this.state.user);
      try {
        responseJson = JSON.parse(response)
        response = JSON.parse(responseJson[responseJson.length-1])
      }
      catch (error) {
        response = 'responseError: '+error.toString()
      }

      if (response.status ==='ok') {
        updated = true
      }

      // Wait at least 5 seconds so they can see the modal message
      setTimeout(()=> {
        this.setState({repoUpdated: updated, updateRepoModalVisible: false})
        this.checkForUpdate(this.state.user)
      }, 5000)
    }

    setUpdateRepoModalVisible(visible) {
      this.setState({updateRepoModalVisible: visible});
    }

    setBranch(branch) {
      if (branch != '') {
        this.setState({selectedBranch: branch})
      }
    }

    setUserAccount() {
      content = '{"username":"'+this.state.discordUser+'", "email": "'+this.state.email+'"}'
      ChffrPlus.writeParam(Params.KEY_COMMUNITYPILOT_USER,content);
      this.setState({accountSet: true, route: ForkRoutes.PRIMARY});
    }

    renderUpdateRepoBtn() {
      const {hasUpdate} = this.state;

      if (hasUpdate.toString() === '1') {
        return (
          <X.Button
            size='small'
            color='updateAvailable'
            style={[Styles.Btn200, {marginTop: 20}]}
            onPress={ () => this.updateRepo() }>
            Update Available
          </X.Button>
        )
      }
      else {
        return null
      }
    }

    renderBranchPicker() {
      const {branches} = this.state;

      const branchItems = branches.map((item) => {
        return (
          <Picker.Item label={item} value={item} />
        )
      })

      return (
        <View style={Styles.pulldownView}>
          <Picker
            selectedValue={this.state.selectedBranch}
            mode='dropdown'
            style={Styles.pulldownStyle}
            onValueChange={(itemValue, itemIndex) =>
              this.setBranch(itemValue)
            }>
            {branchItems}
          </Picker>
        </View>
      )
    }

    renderForkDetails() {
      const {repoBranch, hasUpdate, repoUpdated, updateRepoModalVisible, branches, selectedBranch} = this.state;

      let debug = null

      if (DEBUG) {
        debug = (
          <X.Text color='white' weight='light' style={ Styles.forkDescription }>
            repoBranch: {repoBranch} selectedBranch: {selectedBranch}
          </X.Text>
        )
      }

      return (
        <X.Gradient color='dark_blue'>
          <View color='darkBlue' style={ Styles.viewContainer }>
            <Modal
              animationType="slide"
              transparent={false}
              visible={updateRepoModalVisible}
              >
              <View style={ Styles.modalStyle }>
                <X.Text style={ Styles.forkDescription }>
                  Updating repository openpilot.{this.state.user}...
                </X.Text>
                <X.Text style={ Styles.forkDescription }>
                  One moment please.
                </X.Text>
              </View>
            </Modal>
            <View style={ Styles.viewHeader }>
              <X.Button
                 color='ghost'
                 size='small'
                 onPress={ () => this.handleNavigatedFromMenu(this.state.user, ForkRoutes.PRIMARY) }>
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
                   Current Branch (tap to change):
                 </X.Text>
                 {this.renderBranchPicker()}
                 <View style={ Styles.installBtn }>
                   {this.renderUpdateRepoBtn()}
                 </View>
                 <View style={ Styles.installBtn }>
                   {this.renderLoadBtn()}
                 </View>
                 <View style={ Styles.installBtn }>
                   {this.renderDeleteBtn()}
                 </View>
                 {debug}
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

    forkPressed(user) {
      this.checkForUpdate(user)
      this.handleNavigatedFromMenu(user, ForkRoutes.FORKDETAILS)
    }

    renderAccountScreen() {
      const {discordUser, email} = this.state;

      let debug = null

      if (DEBUG) {
        debug = (
          <X.Text color='white' weight='light' style={ Styles.forkDescription }>
            Debug: {'discordUser: '+discordUser+' email: '+email}
          </X.Text>
        )
      }

      return (
        <X.Gradient color='dark_blue'>
          <View color='darkBlue' style={ Styles.viewContainer }>
            <View style={ Styles.viewHeader }>
              <X.Button
                 color='ghost'
                 size='small'
                 onPress={ () => this.handleNavigatedFromMenu(this.state.user, ForkRoutes.PRIMARY) }>
                 {'<  Back'}
               </X.Button>
             </View>
             <ScrollView
               ref="forkScrollView"
               style={ Styles.viewWindow }>
               <View>
                 <TextInput
                  style={Styles.textInput}
                  placeholder="Discord Username"
                  placeholderTextColor="#444444"
                  value={this.state.discordUser}
                  maxLength={60}
                  onChangeText={(discordUser) => this.setState({discordUser})}
                  underlineColorAndroid="transparent"
                  />
                  <TextInput
                   value={this.state.email}
                   style={[Styles.textInput,{width: 300}]}
                   placeholder="Email"
                   textContentType="emailAddress"
                   placeholderTextColor="#444444"
                   maxLength={200}
                   onChangeText={(email) => this.setState({email})}
                   underlineColorAndroid="transparent"
                   />
                   <X.Button
                       size='small'
                       color='setupPrimary'
                       style={{width: 200, marginTop: 10, marginLeft: 15}}
                       onPress={ () => this.setUserAccount() }>
                       Set Account
                   </X.Button>
                 {debug}
               </View>
             </ScrollView>
          </View>
        </X.Gradient>
      )
    }

    renderAccountStatus() {
      return (
        <View key={ 1 } style={ Styles.settingsMenuItem }>
            <X.Button
                color='transparent'
                size='full'
                style={ Styles.settingsMenuItemButton }
                onPress={ () => this.handleNavigatedFromMenu(this.state.user, ForkRoutes.ACCOUNT) }>
                <X.Image
                    source={ Icons.user }
                    style={ Styles.settingsMenuItemIcon } />
                <X.Text
                    color='white'
                    size='small'
                    weight='semibold'
                    style={ Styles.settingsMenuItemTitle }>
                    CP Account
                </X.Text>
                <X.Text
                    color='white'
                    size='tiny'
                    weight='light'
                    style={ Styles.settingsMenuItemContext }>
                    { this.state.accountSet ? 'Set' : 'Not Set' }
                </X.Text>
            </X.Button>
        </View>
      )
    }
    renderPrimaryScreen() {
      const { discordUser, email, isLoading, status, repos, currentRepo, currentBranch, repoBranches } = this.state;

      /*if (isLoading) {
        return (
          <ActivityIndicator size="large" color="#0000ff" animating={isLoading} />
        );
      }*/

      let debug = (
        <X.Text
          color='white' weight='light'
          style={ Styles.communityForkContext }>
        </X.Text>
      )

      if (DEBUG) {
        debug = (
            <X.Text
              color='white' weight='light' size='tiny'
              style={ Styles.communityForkContext }>
              Debug: {'user: '+discordUser+' email: '+email}
            </X.Text>
        )
      }

      try {
        contents = repos.map((item) => {
          let branches = []
          try {
            branches = JSON.parse(this.state.repoBranches+'}')
          }
          catch (error) {
          }

          let branch = branches[item.user]
          let btnColor = 'settingsDefault'
          try {
            if (this.state.currentRepo === 'openpilot.'+item.user) {
              btnColor = 'setupPrimary'
            }
          }
          catch (error) {
          }

          return (
            <View>
              <X.Button
                  size='small'
                  color={btnColor}
                  style={Styles.updateBtn}
                  onPress={ () => this.forkPressed(item.user) }>
                  {item.user+' ('+branch+')'}
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
                <View style={Styles.topView}>
                  {this.renderAccountStatus()}
                  <View style={{flex: 1, flexDirection: 'column'}}>
                    <X.Text
                      size='medium' color='white' weight='bold'
                      style={ Styles.headline }>
                      Welcome to CommunityPilot Forks
                    </X.Text>
                    <View style={Styles.versionView}>
                      <X.Text
                        color='white' weight='light' size='tiny'
                        style={ Styles.communityForkContext }>
                        {VERSION}
                      </X.Text>
                    </View>
                  </View>
                </View>
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
                  <Bold>Step 4:</Bold> Select the branch from the pulldown list and tap the "Load this branch"
                  button to switch to the selected fork and branch.
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
            case ForkRoutes.ACCOUNT:
                return this.renderAccountScreen();
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
    loadRepo: (username,branch) => {
      if (branch != '') {
        ChffrPlus.loadCommunityPilotRepo(username,branch);
        Alert.alert('Switching Repo', ' Your EON will reboot automatically.', [
        ]);
      }
    },
    doUpdate: () => {
      ChffrPlus.updateCommunityPilotAPK();
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForks);
