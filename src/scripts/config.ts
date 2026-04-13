export interface AppConfiguration {
  clientID: string;
  redirectUri: string;
  genesysCloud: {
    region: string;
  };
}

const configuration: AppConfiguration = {
  clientID: 'insert-your-client-id-here',
  redirectUri: 'http://localhost:3000/',
  genesysCloud: {
    // Default region
    region: 'mypurecloud.com',
  },
};

export default configuration;
