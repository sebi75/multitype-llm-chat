SO HERE:

We need to get the link through the request

Then we need to make a request to the link and extract the following from the
response's metatags:
title;
og:description;
og:image;
og:image:type
og:image:width
og:image:height

We need to get the data, construct a JSON response and send it back to the client

Maybe will need to use some kind of cache to store the data
