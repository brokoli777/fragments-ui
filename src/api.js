// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

export async function postUserFragment(user, fragmentText, contentType) {

  console.log('Posting user fragment data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': contentType,
      },
      body: fragmentText
    });
    
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully posted user fragment data', { data });

    return data;
  } catch (err) {
    console.error('Error creating new fragment', { err });
  }
}

export async function deleteFragment(user, fragmentId) {
  console.log('Deleting user fragment data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully deleted user fragment data');
    return data;

  } catch (err) {
    console.error('Error deleting fragment', { err });
  }
}

export async function updateFragment(user, fragmentId, fragmentText, contentType) {
  console.log('Updating user fragment data...');

  console.log("fragmentText:", fragmentText);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'PUT',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': contentType,
      },
      body: fragmentText
    });

    console.log('Response', res);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully updated user fragment data', { data });
    return data;
  } catch (err) {
    console.error('Error updating fragment', { err });
  }
}

export async function getFragment(user, fragmentId) {
  console.log('GET user fragment data...', fragmentId);
  try {

    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      headers: user.authorizationHeaders(),
    });

    console.log('Response', res);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    
    const contentType = res.headers.get('Content-Type');
    console.log('Content-Type:', contentType);

    if (contentType && contentType.startsWith('image/')) {
      // Handle image response
      const imageUrl = URL.createObjectURL(await res.blob());
      console.log('Image URL:', imageUrl);
      document.getElementById('getImage').src = imageUrl;
      document.getElementById('getFragmentText').innerHTML = '';
    } else {
      document.getElementById('getImage').src = '';
      const data = await res.text();
      console.log("text data", data);
      document.getElementById('getFragmentText').innerHTML = data;
    }

    alert('Fragment retrieved successfully');
  } catch (err) {
    console.error('Error getting fragment', { err });
  }
}