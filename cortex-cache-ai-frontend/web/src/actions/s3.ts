"use server"

export const uploadFileUsingPresignedUrl = async (form: FormData, url: string) => {
    const file = form.get('file') as File
    const binaryFile = await file.arrayBuffer()
    const fileBuffer = Buffer.from(binaryFile)
    const uploadResult = await fetch(url, {
        method: "PUT",
        body: fileBuffer,
        headers: {
            'Content-Type': file.type
        }
    })
    console.log(uploadResult)
    // const res = await uploadResult.json()
    // console.log(res)
    if (uploadResult.ok) {
        return {
            status: 200
        }
    } else {
        return {
            status: 500
        }
    }
}