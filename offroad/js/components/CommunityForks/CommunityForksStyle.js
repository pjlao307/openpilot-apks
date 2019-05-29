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
})
