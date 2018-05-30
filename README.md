# sendit ✈️
### A serverless remote torrenting utility

### Overview
Sendit allows users to torrent files using their magnet link on the cloud without using servers. It does this by using continuous integration platforms (CircleCi in this case) to download files on the cloud. It then uploads the torrented file to Mozilla Firefox Send, and provides a link to download it from Send as a GitHub status check.

By using Mozilla Firefox Send, all the files are encrypted, and automatically delete after 24 hours or after the first download, which ever comes first.

### Usage
Once CircleCi is setup and the GitHub access token has been setup, simply open a PR and add in the magnet link for the torrent. Specifically, this line in the `config.yml`
```bash
$ aria2c -d temp --seed-time=2 --seed-ratio=0.1 'MAGNET_LINK'
```
Once you commit the change to the PR with the proper magnet link, if everything was setup correctly, the PR will have a status check with a link to download the file once the download is complete and successful.


##### Disclaimer: this utility in no way supports or encourages torrenting of illegal and prohibited content. I am not liable for anything that happens as a result of using sendit. Use at your own risk.

## Made with ❤️ by [Rikin Katyal](https://sirvar.com)
