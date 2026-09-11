# Plan
saya ingin membuat sebuah website untuk melakukan tracking lowongan pekerjaan yang sudah diapply, website ini nantinya akan menampilkan 2 halaman (dibuat pada side bar saja), yaitu:
1. Dashboard
2. Work

## Dashboard
pada halaman ini nantinya akan menampilkan summary berupa statistik seluruh progress dalam berbentuk chart, dll

## Work
pada halaman ini hanya menampilkan list lowongan pekerjaan, serta ada tombol untuk menambahkan lowongan pekerjaan yang baru saja di lamar. isinya itu adalah:
1. Nama Perusahaan
2. Posisi
3. Tanggal Apply (cukup tanggal saja, kalau bisa dibuat menggunakan date picker)
4. Status (Apply, HR Interview, Test, User Interview, Offering, Gagal)
5. Deskripksi pekerjaan (kolom input ini harus dibuat lebih panjang, dan lebar. karena kolom ini akan di inputkan text yang cukup panjang dan nantinya akan ada spesial karakter juga)

pada halaman ini juga user dapat mengklik salah satu datanya untuk melihat detail datanya.
pada halaman ini juga user dapat mengubah datanya.
jadi nanti ketika menampilkan detail data itu menggunakan form (Berbentuk pop up) yang sama untuk menambahkan data atau mengedit data, tapi jika melihat detail data itu kolomnya harus di disable agar menghindari kesalahan tidak disengaja mengubah data 

# Tech Stack
- Project ini dibuat dengan menggunakan Full Next JS (Front End dan Back End (API) pada 1 project)
- Menggunakan Database MySQL (username: root, password: kosong atau tidak ada atau null)
- Menggunakan ORM Prisma
- struktur folder harus dibuat sesuai dengan best practice dan harus memanfaat component.
- Code harus ditulis dengan rapih dan mudah dipahami agar mudah di maintenance oleh AI atau Developer
- segala credential di tulis dalam file .env
- setiap kolom input dibuat validasi input agar data yang dikirimkan ke server itu sesuai

## Schema database
- id -> diusahakan UUID
- company_name
- position
- apply_date
- status (ini dibuat ENUM saja agar tidak ada Human error)
- description
- createAt (datetime)
- updateAt (datetime)

# Design
buat tampilannya semenarik mungkin, semodern mungkin, seinteraktif mungkin agar user tertarik meggunakan website ini
