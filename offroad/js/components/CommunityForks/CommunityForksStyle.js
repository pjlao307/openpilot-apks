import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  paragraph: {
      paddingBottom: '15',
  },
  viewContainer: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,.03)',
    flex: 1,
  },
  viewHeader: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,.05)',
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    paddingTop: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
  },
  viewWindow: {
    height: 'auto',
    paddingLeft: 10,
    paddingRight: 10,
  },
  headline: {
    paddingBottom: 20,
  },
  forkDescription: {
    paddingBottom: 20,
  },
  communityForkHeader: {
    paddingBottom: 10,
  },
  installBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  textInput: {
    width: 200,
    color: '#000000',
    size: 30,
    borderWidth: 1,
    paddingLeft:5,
    paddingRight: 5,
    margin: 5,
    marginLeft: 15,
    height: 40,
    borderColor: '#5ddfff',
    backgroundColor: "#dddddd",
    borderRadius: 10,
  },
  addRepoBtnView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  Btn200: {
    width: 200,
    marginTop: 5,
  },
  communityForkContext: {
    paddingBottom: 15,
  },
  updateBtnView: {
    width: 200,
    paddingTop: 5,
    marginTop: 10,
  },
  modalStyle: {
    marginTop: 30,
    marginLeft: 30,
  },
  pulldownStyle: {
    color: '#000000',
    flex: 1,
  },
  pulldownView: {
    backgroundColor: '#ffffff',
    borderColor:'#5ddfff',
    borderRadius: 20,
    borderWidth: 2,
    paddingTop: 0,
    paddingLeft: 0,
    paddingBottom: 0,
  },
  versionView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  topView: {
    flex: 1,
    flexDirection: 'row',
  },

  settingsMenuItem: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(233,233,233,.05)',
    display: 'flex',
    height: '100%',
    width: '25%',
  },
  settingsMenuItemBorderless: {
    borderRightWidth: 0,
  },
  settingsMenuItemButton: {
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 0,
  },
  settingsMenuItemIcon: {
    height: 50,
    marginTop: 10,
    width: 50,
  },
  settingsMenuItemTitle: {
    alignItems: 'center',
    display: 'flex',
    paddingTop: 3,
    paddingBottom: 3,
  },
  settingsMenuItemContext: {
    alignItems: 'center',
    display: 'flex',
    paddingBottom: 20,
  },
})
