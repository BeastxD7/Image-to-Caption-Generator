document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("dropArea");
    const imageInput = document.getElementById("imageInput");
    const browseButton = document.getElementById("browseButton");
    const generateCaptionButton = document.getElementById("generateCaption");
    const imagePreview = document.getElementById("imagePreview");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const captionElement = document.getElementById("caption");
    const saveCaptionButton = document.getElementById("saveCaption");
    const captionHistory = document.getElementById("captionHistory");

    let selectedFile = null;

    function showLoadingIndicator(show) {
        loadingIndicator.style.display = show ? "flex" : "none";
    }

    function resetCaption() {
        captionElement.innerText = "";
    }

    function previewImage(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxImageWidth = 800;
                const maxImageHeight = 600;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxImageWidth) {
                        height *= maxImageWidth / width;
                        width = maxImageWidth;
                    }
                } else {
                    if (height > maxImageHeight) {
                        width *= maxImageHeight / height;
                        height = maxImageHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg');
                imagePreview.src = dataUrl;
                imagePreview.classList.remove("hidden");
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
        resetCaption();
    }

    async function uploadAndGenerateCaption(file) {
        showLoadingIndicator(true);
        resetCaption();

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5000/caption", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            captionElement.innerText = responseData.caption;
            saveCaptionButton.classList.remove("hidden");
        } catch (error) {
            console.error("Error uploading file:", error);
            captionElement.innerText = "Failed to generate caption. Please try again.";
        } finally {
            showLoadingIndicator(false);
        }
    }

    function saveCaption() {
        const captionText = captionElement.innerText;
        const imageData = imagePreview.src;
        if (captionText && imageData) {
            const captions = JSON.parse(localStorage.getItem("captions")) || [];
            captions.push({ image: imageData, caption: captionText });
            localStorage.setItem("captions", JSON.stringify(captions));
            displayCaptionHistory();
        }
    }

    function displayCaptionHistory() {
        captionHistory.innerHTML = "";
        const captions = JSON.parse(localStorage.getItem("captions")) || [];
        captions.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.className = "bg-gray-800 p-2 rounded my-2";
            listItem.innerHTML = `<img src="${item.image}" alt="Image" class=" object-cover w-16 h-16 inline-block mr-4 rounded"><span>${item.caption}</span>`;
            captionHistory.appendChild(listItem);
        });
    }

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("border-blue-500");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("border-blue-500");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("border-blue-500");
        selectedFile = e.dataTransfer.files[0];
        previewImage(selectedFile);
    });

    browseButton.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        selectedFile = imageInput.files[0];
        previewImage(selectedFile);
    });

    generateCaptionButton.addEventListener("click", () => {
        if (selectedFile) {
            uploadAndGenerateCaption(selectedFile);
        } else {
            alert("Please select an image first.");
        }
    });

    saveCaptionButton.addEventListener("click", saveCaption);

    // Load and display saved captions on page load
    displayCaptionHistory();
});
