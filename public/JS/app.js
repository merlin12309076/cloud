// The URIs of the REST endpoints
const RAAURI = "https://prod-13.uksouth.logic.azure.com/workflows/37eab732751a42d38127b0f0ebe9f723/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=H8anB-pA9Gr4_7pw3o5W3ucjn7mckXFPFtHCWq37q4A";
const CIAURI = "https://prod-13.uksouth.logic.azure.com/workflows/06be87996143459da51ec46bad3d842e/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=kNfpxIMudYtuuQz90v0pzajJN5kOZmb7yEAgh036odY";
const DIAURI0 = "https://prod-01.uksouth.logic.azure.com/workflows/79f600a2312c492e913da08f145a0232/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media/";
const DIAURI1 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=RVo8NtPruw6gp8HCv09d0XeTPxDRQXtnDdetGJj7WEU";
const UIAURI0 = "https://prod-05.uksouth.logic.azure.com/workflows/93f327d727d64eee86f115214e92d274/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media/";
const UIAURI1 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=8X8cgbhGpSNPiqtUR9deHS4B5QZRtPN29c3QBgvu5Zs";
const logicAppUri = "https://prod-20.uksouth.logic.azure.com:443/workflows/569e81e711f04492831e858ea81818a3/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Dl0nNW6_84jFAChNgYAD4LY-pqlNSwz-DxCprGf56p0";
const DIBURI = "https://prod-31.uksouth.logic.azure.com:443/workflows/e4b060b5747b4d989d7b535e4112e453/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=sRax2tCnMsGnaDl3q831bahSMZSLRzSrcZ4NpjPHUuU";
const RIAURI0 = "https://prod-05.uksouth.logic.azure.com/workflows/a621bf7c3f024e2fb2256f872c9b8ce7/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media/";
const RIAURI1 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=fFeftQ812kETGNgabf2_N638EJ10J0ZA-PBK0TF42t0";

$(document).ready(function () {
  $("#retAssets").click(function () {
    getAssetList();
  });

  $("#subNewForm").click(function () {
    submitNewAsset();
  });

  $("#subEditForm").click(function () {
    editAsset();
  });
});

let mediaType = ""; // Global variable to store detected media type

// Function to detect the media type based on file extension
function detectMediaType(file) {
  if (file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return fileExtension;
  }
  return "";
}

// Function to upload media file to Azure Blob Storage via Logic App
function uploadToBlob(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("UserID", "tempUserID"); // Replace with dynamic user ID
    formData.append("UserName", "tempUserName"); // Replace with dynamic user name
    formData.append("FileName", file.name);

    $.ajax({
      url: logicAppUri,
      type: "POST",
      data: formData,
      processData: false,   // Don't process the data (needed for file uploads)
      contentType: false,   // Don't set content type (needed for file uploads)
      success: function (response) {
        const fileUrl = response.fileUrl || "defaultFileUrl"; // Ensure file URL is returned
        resolve(fileUrl);
      },
      error: function (error) {
        reject("Error uploading file: " + JSON.stringify(error));
      }
    });
  });
}

// Function to submit a new media asset
function submitNewAsset() {
  const mediaFile = $("#Media_File")[0].files[0];
  const mediaData = {
    Title: $("#Title").val(),
    Description: $("#Description").val(),
    Media_type: mediaFile ? detectMediaType(mediaFile) : "",
    tags: $("#tags").val(),
  };

  if (mediaFile) {
    uploadToBlob(mediaFile)
      .then((mediaUrl) => {
        mediaData.Media_URL = mediaUrl;

        console.log("Uploading media data to SQL...");
        $.ajax({
          url: CIAURI,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(mediaData),
          success: function (response) {
            console.log("Media added to database:", response);
            alert("Media successfully added!");
            $("#addMediaModal").modal("hide");
            getAssetList();
          },
          error: function (error) {
            console.error("Error adding media:", error);
            alert("Error adding media: " + JSON.stringify(error));
          },
        });
      })
      .catch((error) => {
        console.error("File upload error:", error);
        alert("Error uploading file: " + error);
      });
  } else {
    alert("Please select a media file.");
  }
}

// Function to fetch and display the media list
function getAssetList() {
  $("#AssetList").html('<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>');

  $.getJSON(RAAURI, function (data) {
    let items = [];

    data.forEach((val) => {
      let mediaPreview = '';
      if (val.Media_URL) {
        const fileExtension = val.Media_type;

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          mediaPreview = `<img src="${val.Media_URL}" class="card-img-top" alt="Media Preview" style="height: 200px; object-fit: cover;">`;
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          mediaPreview = `<video class="card-img-top" controls style="height: 200px; object-fit: cover;">
                            <source src="${val.Media_URL}" type="video/${fileExtension}">
                            Your browser does not support the video tag.
                          </video>`;
        } else {
          mediaPreview = `<div class="card-img-top" style="height: 200px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center;">
                            <span class="text-muted">No preview available</span>
                          </div>`;
        }
      }

      items.push(`
        <div class="col-md-3 media-item">
          <div class="card shadow-sm">
            ${mediaPreview}
            <div class="card-body">
              <h5 class="card-title">${val.Title}</h5>
              <p class="card-text text-truncate">${val.Description || "No description provided."}</p>
              <p class="card-text"><strong>Type:</strong> ${val.Media_type}</p>
              <p class="card-text"><strong>Tags:</strong> ${val.tags || "None"}</p>
              <a href="${val.Media_URL}" target="_blank" class="btn btn-primary btn-sm">View</a>
              <button class="btn btn-secondary btn-sm" onclick="editAsset(${val.MediaID})">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteAsset(${val.MediaID}, '${val.Media_URL}')">Delete</button>
            </div>
          </div>
        </div>
      `);
    });

    $("#AssetList").html(`<div class="row g-3">${items.join("")}</div>`);
  });
}

// Function to delete the asset from both SQL and Blob Storage via Logic App
function deleteAsset(mediaID, mediaUrl) {
  if (confirm("Are you sure you want to delete this asset?")) {
    const relativePath = new URL(mediaUrl).pathname.substring(1); // Extract relative path

    triggerLogicAppDelete(relativePath)
      .then(() => {
        $.ajax({
          url: `${DIAURI0}${mediaID}${DIAURI1}`,
          type: "DELETE",
          success: function () {
            alert("Media successfully deleted!");
            getAssetList();
          },
          error: function (error) {
            alert("Error deleting media from SQL: " + JSON.stringify(error));
          },
        });
      })
      .catch((error) => {
        alert("Error deleting file from Blob Storage: " + error);
      });
  }
}

// Function to trigger Logic App for Blob deletion
function triggerLogicAppDelete(relativePath) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: DIBURI,
      type: "post",
      contentType: "application/json",
      data: JSON.stringify({ relativePath }),
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject("Error triggering Logic App: " + JSON.stringify(error));
      },
    });
  });
}

const editAsset = (mediaID) => {
  // Fetch the current asset data
  $.getJSON(`${RIAURI0}${mediaID}${RIAURI1}`, function (data) {

    if (!data || data.length === 0) {
      alert("Asset not found!");
      return;
    }

    // Populate the form fields with current data
    $('#editMediaID').val(data.MediaID);
    $("#EditTitle").val(data.Title);
    $("#EditDescription").val(data.Description);
    $("#EditTags").val(data.tags || "");

    // Display the current media preview
    let mediaPreview = '';
    if (data.Media_URL) {
      const fileExtension = data.Media_type;
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        mediaPreview = `<img src="${data.Media_URL}" class="img-fluid" alt="Current Media">`;
      } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        mediaPreview = `<video class="w-100" controls>
                          <source src="${data.Media_URL}" type="video/${fileExtension}">
                          Your browser does not support the video tag.
                        </video>`;
      } else {
        mediaPreview = `<a href="${data.Media_URL}" target="_blank" class="btn btn-link">View Current Media</a>`;
      }
    } else {
      mediaPreview = `<p class="text-muted">No media file associated.</p>`;
    }
    $("#EditMediaPreview").html(mediaPreview);

    // Show the modal
    const editMediaModal = new bootstrap.Modal(document.getElementById('editMediaModal'));
    editMediaModal.show();
  });
};


// Function to update the asset
$("#updateAsset").click(() => {
  
  const mediaID = $("#editMediaID").val();

  const updatedData = {
    MediaID: mediaID,
    Title: $("#EditTitle").val(),
    Description: $("#EditDescription").val(),
    tags: $("#EditTags").val(),
  };



// Azure API credentials
const subscriptionKey = "DVLKJeFTl62qd7CmjDBL4sKEgTYg58OdXJsFYPdX67VvEJu11DnzJQQJ99ALACULyCpXJ3w3AAAbACOGw5er"; // Replace with your API key
const endpoint = "https://api.cognitive.microsofttranslator.com/"; // Use your region-specific endpoint
const region = "global"; // Replace with your Azure region (e.g., "westus")

// Function to translate the page
function translatePage() {
    const selectedLanguage = document.getElementById("languageSelector").value;

    // Text elements that need translation
    const textsToTranslate = [
        { id: "pageTitle", text: "Welcome to the Page" },
        { id: "pageDescription", text: "This is a professional page layout." },
        { id: "uploadButton", text: "Upload" },
        { id: "homeLink", text: "Home" }
    ];

    // Create a list of texts to be translated
    const textArray = textsToTranslate.map(item => item.text);

    // Translate using Azure API
    translateText(textArray, selectedLanguage)
        .then(translatedTexts => {
            // Apply translated texts to the respective elements
            translatedTexts.forEach((translatedText, index) => {
                document.getElementById(textsToTranslate[index].id).textContent = translatedText;
            });
        })
        .catch(error => {
            console.error("Error with translation:", error);
        });
}

// Function to call Azure Translator API
function translateText(textArray, targetLanguage) {
    const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;

    const requestBody = textArray.map(text => ({ Text: text }));

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            "Ocp-Apim-Subscription-Region": region
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        // Extract translated texts from the response
        return data[0].translations.map(translation => translation.text);
    });
}



  const newMediaFile = $("#EditMedia_File")[0].files[0];

  // Check if a new media file is uploaded
  if (newMediaFile) {
    // Upload the new media file
    uploadToBlob(newMediaFile)
      .then((newMediaUrl) => {
        
        updatedData.Media_URL = newMediaUrl;
        updatedData.Media_type = detectMediaType(newMediaFile);  // Detect and set media type

        // Fetch the old asset data to get the old media URL
        $.getJSON(`${RIAURI0}${mediaID}${RIAURI1}`, function (oldData) {
          
          const oldMediaUrl = oldData[0]?.Media_URL;

          // Delete the old media from Blob Storage
          if (oldMediaUrl) {
            const relativePath = new URL(oldMediaUrl).pathname.substring(1);
            
            triggerLogicAppDelete(relativePath)
              .then(() => {
                // Update the asset in SQL
                updateAssetInSQL(updatedData);
              })
              .catch((error) => {
                console.error("Error deleting old media: ", error);
              });
          } else {
            // Update the asset in SQL without deleting old media
            updateAssetInSQL(updatedData);
          }
        });
      })
      .catch((error) => {
        console.error("Error uploading new media file: ", error);
      });
  } else {
    // Fetch the old asset data to get the existing Media URL
    $.getJSON(`${RIAURI0}${mediaID}${RIAURI1}`, function (data) {
      const oldMediaUrl = data.Media_URL;
      const oldMediaType = data.Media_type;  // Fetch the old media type

      // If no new file is uploaded, keep the existing Media URL and type
      if (oldMediaUrl) {
        updatedData.Media_URL = oldMediaUrl; // Keep the existing URL
        updatedData.Media_type = oldMediaType;  // Keep the existing Media type
      }

      // Update the asset in SQL with the existing URL and type
      updateAssetInSQL(updatedData);
    });
  }
});


// Helper function to update the asset in SQL
const updateAssetInSQL = (updatedData) => {
  alert(JSON.stringify(updatedData));
  $.ajax({
    url: `${UIAURI0}${updatedData.MediaID}${UIAURI1}`, // Update endpoint 
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(updatedData),
    success: function (response) {
      $("#editAssetModal").modal("hide");
      getAssetList(); // Refresh the asset list
    },
    error: function (error) {
      alert("Error updating asset: " + JSON.stringify(error));
    },
  });
};

// Function to translate the page
function translatePage() {
  const selectedLanguage = document.getElementById("languageSelector").value;

  // Text elements that need translation
  const textsToTranslate = [
      { id: "pageTitle", text: "Welcome to the Page" },
      { id: "pageDescription", text: "This is a professional page layout." },
      { id: "uploadButton", text: "Upload" },
      { id: "homeLink", text: "Home" }
  ];

  // Create a list of texts to be translated
  const textArray = textsToTranslate.map(item => item.text);

  // Translate using Azure API
  translateText(textArray, selectedLanguage)
      .then(translatedTexts => {
          // Apply translated texts to the respective elements
          translatedTexts.forEach((translatedText, index) => {
              document.getElementById(textsToTranslate[index].id).textContent = translatedText;
          });
      })
      .catch(error => {
          console.error("Error with translation:", error);
      });
}

// Function to call Azure Translator API
function translateText(textArray, targetLanguage) {
  const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;

  const requestBody = textArray.map(text => ({ Text: text }));

  return fetch(url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Ocp-Apim-Subscription-Region": region
      },
      body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
      // Extract translated texts from the response
      return data[0].translations.map(translation => translation.text);
  });
}