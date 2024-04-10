function userInformationHTML(user){
    return `
        <h2>${user.name}
            <span class="small-name">
                (@<a href="${user.html_url}") target="_blank">${user.login}</a>)
            </span>
        </h2>
        <div class="gh-content">
            <div class="gh-avatar">
                <a href="${user.html_url} target="_blank">
                    <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}" />
                </a>
            </div>
            <p>Followers: ${user.followers} - Following ${user.following} <br> Repos}</p>
        </div>`
}

function repoInformationHTML(repos) {
    if (repos.length == 0) {
        return `<div class="clearfix repo-list">No repos!</div>`;
    }

    var listItemsHTML = repos.map(function(repo) {
        return `<li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </li>`;
    });

    return `<div class="clearfix repo-list">
                <p>
                    <strong>Repo List:</strong>
                </p>
                <ul>
                    ${listItemsHTML.join("\n")}
                </ul>
            </div>`;
}

function fetchGitHubInformation(event) {
    $("#gh-user-data").html("");
    $("#gh-repo-data").html("");

    var username = $("#gh-username").val();
    if (!username) {
        $("#gh-user-data").html(`<h2>Please enter a GitHub username</h2>`);
        return;
    }
    
    $("#gh-user-data").html(
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..." />
        </div>`);

        $.when(
            $.getJSON(`https://api.github.com/users/${username}`),
            $.getJSON(`https://api.github.com/users/${username}/repos`)
        ).then(
            function(firstResponse, secondResponse) {
                var userData = firstResponse[0];
                var repoData = secondResponse[0];
                $("#gh-user-data").html(userInformationHTML(userData));
                $("#gh-repo-data").html(repoInformationHTML(repoData));

            }, 
            function(errorResponse) {
                if (errorResponse.status === 404) {
                    $("#gh-user-data").html(
                        `<h2>No info found for user ${username}</h2>`);
                    } else if (errorResponse.status === 403) {
                        var resetTime = new Date(errorResponse.getResponseHeader('X-RateLimit-Reset') * 1000);
                        var currentTime = new Date();
                        var timeDifference = resetTime.getTime() - currentTime.getTime();
                        var secondsRemaining = Math.floor(timeDifference / 1000);
                    
                        function formatTime(seconds) {
                            var hours = Math.floor(seconds / 3600);
                            var minutes = Math.floor((seconds % 3600) / 60);
                            var remainingSeconds = seconds % 60;
                    
                            return `${minutes} minutes, and ${remainingSeconds} seconds`;
                        }
                    
                        var countdownMessage = `<h4>Too many requests, please wait: ${formatTime(secondsRemaining)}</h4>`;
                        $("#gh-user-data").html(countdownMessage);
                    
                        // Update countdown every second
                        var countdownInterval = setInterval(function () {
                            secondsRemaining--;
                            if (secondsRemaining <= 0) {
                                clearInterval(countdownInterval);
                                fetchGitHubInformation(event); // Reload data when countdown is over
                            } else {
                                $("#gh-user-data").html(`<h4>Too many requests, please wait: ${formatTime(secondsRemaining)}</h4>`);
                            }
                        }, 1000);
                    } else {
                    console.log(errorResponse);
                    $("#gh-user-data").html(
                        `<h2>Error: ${errorResponse.responseJSON.message}</h2>`);
                }
            });    
}

$(document).ready(fetchGitHubInformation);
