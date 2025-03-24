interface GoogleOAuth2Response {
  code: string;
}

interface GoogleOAuth2Client {
  requestCode(): void;
}

interface GoogleAccounts {
  oauth2: {
    initCodeClient(config: {
      client_id: string;
      scope: string;
      redirect_uri: string;
      callback: (response: GoogleOAuth2Response) => void;
    }): GoogleOAuth2Client;
  };
}

interface Window {
  google: {
    accounts: GoogleAccounts;
  };
} 