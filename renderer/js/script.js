const form = document.querySelector('#img-form')
const img = document.querySelector('#img')
const outputPath = document.querySelector('#output-path')
const fileName = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width')
const wrapper = document.querySelector('#wrapper')

const isFileImage = (file) => {
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg']

    return !!file && acceptedImageTypes.includes(file.type)
}

const alertError = (message) => {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center',
        },
    })
}

const alertSuccess = (message) => {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center',
        },
    })
}

ipcRenderer.on('image:done', () => {
    alertSuccess('Image resized successfully')


    img.value = ''

    widthInput.value = 0
    heightInput.value = 0
    wrapper.classList.toggle('hidden')
    fileName.innerText = ''
    outputPath.innerText = ''
})

img.addEventListener('change', (e) => {
    const file = e.target.files[0]
    
    if (!isFileImage(file)) {
        alertError('You have to select IMAGE file!')

        return
    }

    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = function () {
        widthInput.value = this.width
        heightInput.value = this.height
    }

    wrapper.classList.toggle('hidden')
    fileName.innerText = file.name
    outputPath.innerText = path.join(os.homedir(), 'imageresizer')
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const width = widthInput.value
    const height = heightInput.value
    const imgPath = img.files[0].path

    if (!img.files[0]) {
        alertError('Please select image')
        return
    }

    if (width === '' || height === '') {
        alertError('Please enter width and height')
        return
    }

    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height,
    })
})