function syncSuiteConfig() {
    this.scheme = 'http';
    this.port = 3027;
    this.common_headers = [{
       name: 'content-type',
       value: 'application/json'
    }];
}

module.exports = {
    syncSuiteConfig: syncSuiteConfig
};
