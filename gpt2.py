from transformers import pipeline

image_to_text = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")

print(image_to_text('https://akcdn.detik.net.id/visual/2022/06/30/anime-spy-x-family-anya-forger_169.jpeg?w=650'))