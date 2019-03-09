$(document).ready(function() {
  $("#download-details").submit(function(e) {
    var title_org = $("#title").val()
    var title = replaceSpacesWithDashes(title_org)
    var magnet = $("#magnet").val()

    if (!isValidMagnetLink(magnet)) {
      alert("Please enter a valid magnet link")
      return
    }

    var base64 = encodeToBase64(magnet)

    // get sha of original file
    $.ajax({
      type: "GET",
      url: "https://api.github.com/repos/dev-sirvar/sendit/contents/.circleci/config.yml?access_token=06826f572b15d8e7ff8d7763caebaaabcff25c1f",
      error: function() {
        sendError("Something went wrong internally. Try again in a few minutes. Or don't. It probably wont be fixed that soon.")
      },
      success: function(data) {
        var fileHash = data.sha
        // get sha hash of master branch
        $.ajax({
          type: "GET",
          url: "https://api.github.com/repos/dev-sirvar/sendit/git/refs/heads/master?access_token=06826f572b15d8e7ff8d7763caebaaabcff25c1f",
          error: function() {
            sendError("Something went wrong. Try again with a different file name.")
          },
          success: function(data) {
            // create new branch
            $.ajax({
              type: "POST",
              url: "https://api.github.com/repos/dev-sirvar/sendit/git/refs?access_token=06826f572b15d8e7ff8d7763caebaaabcff25c1f",
              data: JSON.stringify({
                "ref": "refs/heads/" + title,
                "sha": data.object.sha
              }),
              error: function() {
                sendError("Something went wrong internally. Try again in a few minutes. Or don't. It probably wont be fixed that soon.")
              },
              success: function() {
                // update file
                $.ajax({
                  type: "PUT",
                  url: "https://api.github.com/repos/dev-sirvar/sendit/contents/.circleci/config.yml?access_token=06826f572b15d8e7ff8d7763caebaaabcff25c1f",
                  data: JSON.stringify({
                    "message": "Submit Download Request: " + title,
                    "content": base64,
                    "branch": title,
                    "sha": fileHash
                  }),
                  error: function() {
                    sendError("Something went wrong internally. Try again in a few minutes. Or don't. It probably wont be fixed that soon.")
                  },
                  success: function() {
                    // make pr
                    $.ajax({
                      type: "POST",
                      url: "https://api.github.com/repos/dev-sirvar/sendit/pulls?access_token=06826f572b15d8e7ff8d7763caebaaabcff25c1f",
                      data: JSON.stringify({
                        "title": "Download Request: " + title_org,
                        "head": title,
                        "base": "master"
                      }),
                      error: function() {
                        sendError("Something went wrong internally. Try again in a few minutes. Or don't. It probably wont be fixed that soon.")
                      },
                      success: function(data) {
                        $("#magnet").val("")
                        $("#title").val("")
                        $(".container").append(`
                        <div class="alert alert-success mt-5" role="alert">
                          Your file is queued for download! Click <a href="${data.html_url}">here</a> to check the status
                        </div>
                        `)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
    e.preventDefault()
  })
})

function sendError(e) {
  $(".container").append(`
    <div class="alert alert-danger mt-5" role="alert">
      ${e}
    </div>
    `)
}

function replaceSpacesWithDashes(s) {
  return s.replace(" ", "-")
}

function isValidMagnetLink(s) {
  return s.match(/magnet:\?xt=urn:/i)
}

function encodeToBase64(magnet) {
  var originalFile = `
# Python CircleCI 2.0 configuration file
#
# Check https://circleci.com/docs/2.0/language-python/ for more details
#
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:10.15.0

    working_directory: ~/repo

    steps:
      - checkout

      - run:
          name: install python
          command: |
            sudo apt-get -y install python3-pip

      - run:
          name: install send
          command: |
            sudo pip3 install sendclient

      - run:
          name: install webtorrent-cli
          command: |
            sudo npm i -g webtorrent-cli
            
      - run:
          name: install zip
          command: |
            sudo apt-get install zip
      
      - run:
          name: chmod x send file
          command: |
            chmod +x ./sendit.sh

      - run:
          name: download with webtorrent
          command: |
            webtorrent download "MAGNET_LINK"

      - run:
          name: zip file
          command: |
            zip -r $\{CIRCLE_BRANCH}.zip ./*
            
      - run:
          name: send file
          command: |
            ./sendit.sh $\{CIRCLE_BRANCH}.zip | xargs -I {} curl -k -d '{\"state\":\"success\",\"target_url\":\"{}\",\"context\":\"sendit\"}' -X POST "https://api.github.com/repos/dev-sirvar/sendit/commits/$\{CIRCLE_SHA1}/statuses?access_token=$\{GITHUB_TOKEN}"
  `
  return window.btoa(originalFile.replace("MAGNET_LINK", magnet))
}