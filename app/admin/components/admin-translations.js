"use client";

import { useEffect } from "react";
import { useLanguage } from "../../components/language-provider";

const TURKISH_COPY = {
  "İstatistik": ["Analytics", "Statistiques"], "Reklamlar": ["Ads", "Publicités"], "Sayfalar": ["Pages", "Pages"],
  "Yazılar": ["Posts", "Articles"], "Ayarlar": ["Settings", "Paramètres"], "Genel": ["General", "Général"],
  "Görünürlük": ["Visibility", "Visibilité"], "Modüller": ["Modules", "Modules"], "Profil": ["Profile", "Profil"],
  "E-bülten": ["Newsletter", "Infolettre"], "Yönetim paneli": ["Admin panel", "Panneau d’administration"],
  "Yönetici girişi": ["Admin sign in", "Connexion administrateur"], "Şifre": ["Password", "Mot de passe"],
  "Panele gir": ["Sign in", "Se connecter"], "Giriş yapılıyor…": ["Signing in…", "Connexion…"],
  "Yeni yazı": ["New post", "Nouvel article"], "Yazıyı düzenle": ["Edit post", "Modifier l’article"],
  "Yeni sayfa": ["New page", "Nouvelle page"], "Sayfayı düzenle": ["Edit page", "Modifier la page"],
  "Yeni bülten": ["New newsletter", "Nouvelle infolettre"], "Görsel üret": ["Generate image", "Générer une image"],
  "Başlık": ["Title", "Titre"], "Açıklama": ["Description", "Description"], "İçerik": ["Content", "Contenu"],
  "Özet": ["Summary", "Résumé"], "Ön izleme": ["Preview text", "Texte d’aperçu"], "Önizleme": ["Preview", "Aperçu"],
  "Kategori": ["Category", "Catégorie"], "Etiketler": ["Tags", "Étiquettes"], "Kapak görseli": ["Cover image", "Image de couverture"],
  "Durum": ["Status", "Statut"], "Planlanan tarih": ["Scheduled date", "Date planifiée"],
  "Kaynak adı": ["Source name", "Nom de la source"], "Kaynak URL": ["Source URL", "URL de la source"],
  "Yayın": ["Publishing", "Publication"], "Yayında": ["Published", "Publié"], "Taslak": ["Draft", "Brouillon"],
  "Planlı": ["Scheduled", "Planifié"], "Arşiv": ["Archived", "Archivé"], "İptal": ["Cancelled", "Annulé"],
  "Gönderildi": ["Sent", "Envoyé"], "Aktif": ["Active", "Actif"], "Bekliyor": ["Pending", "En attente"],
  "Ayrıldı": ["Unsubscribed", "Désabonné"], "Kaydet": ["Save", "Enregistrer"], "Kaydediliyor…": ["Saving…", "Enregistrement…"],
  "Vazgeç": ["Cancel", "Annuler"], "Düzenle": ["Edit", "Modifier"], "İşlemler": ["Actions", "Actions"],
  "Tümü": ["All", "Tous"], "En yeni": ["Newest", "Plus récents"], "En eski": ["Oldest", "Plus anciens"],
  "Başlık A–Z": ["Title A–Z", "Titre A–Z"], "Yazı": ["Post", "Article"], "Sıra": ["Order", "Ordre"],
  "Menü sırası": ["Menu order", "Ordre du menu"], "Alıcı": ["Recipients", "Destinataires"], "Açılma": ["Opens", "Ouvertures"],
  "Tıklama": ["Clicks", "Clics"], "Çıkış": ["Unsubscribes", "Désabonnements"], "Sayı": ["Issue", "Numéro"],
  "Kayıt tarihi": ["Signup date", "Date d’inscription"], "Bültenler": ["Newsletters", "Infolettres"],
  "Son yazılar": ["Recent posts", "Articles récents"], "Yayın takvimi": ["Publishing calendar", "Calendrier éditorial"],
  "Görüntüleme": ["Views", "Vues"], "Son 7 gün": ["Last 7 days", "7 derniers jours"],
  "Günlük görüntüleme": ["Daily views", "Vues quotidiennes"], "Trafik kaynakları": ["Traffic sources", "Sources de trafic"],
  "En çok ziyaret edilenler": ["Most visited", "Pages les plus visitées"], "Okur dağılımı": ["Audience breakdown", "Répartition du lectorat"],
  "Ziyaretçi sayfası": ["Visitor site", "Site public"], "Site adı": ["Site name", "Nom du site"], "Alan adı": ["Domain", "Domaine"],
  "Fransızca açıklama": ["French description", "Description française"], "İngilizce açıklama": ["English description", "Description anglaise"],
  "Gösterilecek yazı": ["Posts to display", "Articles à afficher"], "Dil": ["Language", "Langue"],
  "Yazı akışı biçimi": ["Post feed layout", "Présentation du fil"], "Kısa akış": ["Compact feed", "Fil compact"],
  "Kart": ["Cards", "Cartes"], "Klasik liste": ["Classic list", "Liste classique"], "İletişim e-postası": ["Contact email", "E-mail de contact"],
  "E-bülten alanı": ["Newsletter section", "Section infolettre"], "Bülteni göster": ["Show newsletter", "Afficher l’infolettre"],
  "Bülten başlığı": ["Newsletter title", "Titre de l’infolettre"], "Bülten açıklaması": ["Newsletter description", "Description de l’infolettre"],
  "Abone sayısını göster": ["Show subscriber count", "Afficher le nombre d’abonnés"], "Bakım modu": ["Maintenance mode", "Mode maintenance"],
  "Panel modülleri": ["Panel modules", "Modules du panneau"], "Kart ayarları": ["Card settings", "Réglages de la carte"],
  "Yazı tipi": ["Font", "Police"], "Yazı boyutu": ["Font size", "Taille du texte"], "İç boşluk": ["Padding", "Marge intérieure"],
  "Açık": ["Light", "Clair"], "Sıcak": ["Warm", "Chaud"], "Hemen yayınla": ["Publish now", "Publier maintenant"],
  "Buton metni": ["Button label", "Libellé du bouton"], "Görsel URL": ["Image URL", "URL de l’image"],
  "Reklamı ekle": ["Add ad", "Ajouter la publicité"], "Yerel demo veritabanı": ["Local demo database", "Base de démonstration locale"],
  "Abone sayısı ve bakım modu seçenekleri": ["Subscriber count and maintenance mode options", "Options du nombre d’abonnés et du mode maintenance"],
  "Abone sayısı ve bakım modu.": ["Subscriber count and maintenance mode.", "Nombre d’abonnés et mode maintenance."],
  "Abonelik alanı metinleri.": ["Subscription section copy.", "Textes de la zone d’abonnement."],
  "Admin hesabı bilgileri": ["Admin account details", "Informations du compte administrateur"],
  "Demo admin hesabı bilgileri.": ["Demo admin account details.", "Informations du compte administrateur de démonstration."],
  "Arama veya filtreyi değiştirip tekrar deneyin.": ["Change the search or filter and try again.", "Modifiez la recherche ou le filtre, puis réessayez."],
  "Ayarlar yerel veritabanına kaydedildi.": ["Settings saved to the local database.", "Paramètres enregistrés dans la base locale."],
  "Bağlantı adresi": ["Link address", "Adresse du lien"], "Bağlantı ekle": ["Add link", "Ajouter un lien"],
  "Hedef adres": ["Destination URL", "URL de destination"],
  "Başlık 1": ["Heading 1", "Titre 1"], "Başlık 2": ["Heading 2", "Titre 2"], "Alıntı": ["Quote", "Citation"],
  "Başlık veya içerikte ara": ["Search title or content", "Rechercher dans le titre ou le contenu"],
  "Başlık zorunlu.": ["Title is required.", "Le titre est obligatoire."],
  "Başlık, açıklama ve hedef adres gerekli.": ["Title, description and destination URL are required.", "Le titre, la description et l’URL de destination sont obligatoires."],
  "Biçimi temizle": ["Clear formatting", "Effacer la mise en forme"],
  "Boş bırakılırsa başlıktan üretilir.": ["Generated from the title if left blank.", "Généré à partir du titre si ce champ est vide."],
  "Bu işlem geri alınamaz.": ["This action cannot be undone.", "Cette action est irréversible."],
  "Bülten ve abone yönetimi": ["Newsletter and subscriber management", "Gestion de l’infolettre et des abonnés"],
  "Dikey gönderi": ["Portrait post", "Publication verticale"], "Kare gönderi": ["Square post", "Publication carrée"],
  "Hikâye": ["Story", "Story"],
  "Yatay gönderi": ["Landscape post", "Publication horizontale"], "Karusel gönderisi": ["Carousel post", "Publication carrousel"],
  "Reels kapak görseli": ["Reels cover", "Couverture Reels"], "Profil fotoğrafı": ["Profile photo", "Photo de profil"],
  "Eşleşen yazı bulunamadı": ["No matching posts found", "Aucun article correspondant"],
  "Geçerli bir e-posta girin.": ["Enter a valid email address.", "Saisissez une adresse e-mail valide."],
  "Giriş yapılamadı.": ["Sign-in failed.", "Échec de la connexion."],
  "Gönderim demo olarak yerel veritabanına kaydedilir.": ["The send is saved to the local demo database.", "L’envoi est enregistré dans la base locale de démonstration."],
  "Günlük ortalama": ["Daily average", "Moyenne quotidienne"], "Henüz kayıt yok": ["No records yet", "Aucun enregistrement"],
  "Henüz sayfa yok": ["No pages yet", "Aucune page"], "Kalın": ["Bold", "Gras"], "İtalik": ["Italic", "Italique"],
  "Kayıt başarısız.": ["Save failed.", "Échec de l’enregistrement."],
  "Alanlardan biri çok uzun.": ["One of the fields is too long.", "L’un des champs est trop long."],
  "Bu slug ile bir yazı zaten var. Farklı bir slug seçin.": ["A post with this slug already exists. Choose a different slug.", "Un article avec ce slug existe déjà. Choisissez-en un autre."],
  "Yazı kaydedilemedi. Lütfen tekrar deneyin.": ["The post could not be saved. Please try again.", "Impossible d’enregistrer l’article. Veuillez réessayer."],
  "Kayıt MySQL veritabanına yazılır.": ["The record is saved to the MySQL database.", "L’enregistrement est sauvegardé dans la base MySQL."],
  "Keşfet": ["Discover", "Découvrir"], "Menüyü aç": ["Open menu", "Ouvrir le menu"], "Menüyü kapat": ["Close menu", "Fermer le menu"],
  "Ana menü": ["Main menu", "Menu principal"], "Metin biçimlendirme": ["Text formatting", "Mise en forme du texte"],
  "Panel özelliklerini açın veya kapatın.": ["Enable or disable panel features.", "Activez ou désactivez les fonctions du panneau."],
  "Panelde kullanılacak özellikleri açın veya kapatın": ["Enable or disable panel features", "Activez ou désactivez les fonctions du panneau"],
  "Planlanan gönderim": ["Scheduled send", "Envoi planifié"], "Planlanmış bülten yok": ["No scheduled newsletters", "Aucune infolettre planifiée"],
  "Reklam bulunamadı.": ["Ad not found.", "Publicité introuvable."], "Reklam ekleme ve yayınlama": ["Create and publish ads", "Créer et publier des publicités"],
  "Reklam taslağa alındı.": ["Ad moved to drafts.", "Publicité placée en brouillon."], "Reklam yayında.": ["Ad published.", "Publicité publiée."],
  "Reklamı hemen yayınla": ["Publish ad now", "Publier la publicité maintenant"], "Reklamı sil": ["Delete ad", "Supprimer la publicité"],
  "Sayfa bulunamadı.": ["Page not found.", "Page introuvable."],
  "Sayfa içeriği yerel veritabanında tutulur.": ["Page content is stored in the local database.", "Le contenu de la page est stocké dans la base locale."],
  "Sayfayı sil": ["Delete page", "Supprimer la page"], "Site adı, açıklamalar ve akış biçimi.": ["Site name, descriptions and feed layout.", "Nom du site, descriptions et présentation du fil."],
  "Site adı, açıklamalar, alan adı ve akış biçimi": ["Site name, descriptions, domain and feed layout", "Nom du site, descriptions, domaine et présentation du fil"],
  "Sonraki görsel": ["Next image", "Image suivante"], "Önceki görsel": ["Previous image", "Image précédente"],
  "Sunucudan beklenmeyen bir yanıt geldi. Sayfayı yenileyip tekrar deneyin.": ["The server returned an unexpected response. Refresh and try again.", "Le serveur a renvoyé une réponse inattendue. Actualisez et réessayez."],
  "Sunucudan beklenmeyen bir yanıt geldi.": ["The server returned an unexpected response.", "Le serveur a renvoyé une réponse inattendue."],
  "Sunucuya bağlanılamadı. Sayfayı yenileyip tekrar deneyin.": ["Could not connect to the server. Refresh and try again.", "Impossible de se connecter au serveur. Actualisez et réessayez."],
  "Tam ekrandan çık": ["Exit fullscreen", "Quitter le plein écran"], "Tam ekran": ["Fullscreen", "Plein écran"],
  "Tüm ayarlar MySQL veritabanında saklanır.": ["All settings are stored in the MySQL database.", "Tous les paramètres sont stockés dans la base MySQL."],
  "Yazı bulunamadı.": ["Post not found.", "Article introuvable."], "Yazı silindi.": ["Post deleted.", "Article supprimé."],
  "Yazı silinemedi.": ["Post could not be deleted.", "Impossible de supprimer l’article."], "Yazı silinsin mi?": ["Delete post?", "Supprimer l’article ?"],
  "Yazıları sırala": ["Sort posts", "Trier les articles"], "Yazıyı Instagram’da paylaşılabilir bir karta dönüştürün": ["Turn the post into a shareable Instagram card", "Transformez l’article en carte partageable sur Instagram"],
  "Yazıyı sil": ["Delete post", "Supprimer l’article"],
  "Yeni bir bülten oluşturup gönderim tarihini planlayabilirsiniz.": ["Create a newsletter and schedule its send date.", "Créez une infolettre et planifiez sa date d’envoi."],
  "Yeni bir kayıt eklediğinizde burada görünecek.": ["New records will appear here.", "Les nouveaux enregistrements apparaîtront ici."],
  "Ziyaretçi abonelik alanının metinleri ve görünürlüğü": ["Visitor subscription copy and visibility", "Textes et visibilité de la zone d’abonnement"],
  "Ziyaretçi başına": ["Per visitor", "Par visiteur"], "Ön izleme metni eklenmedi": ["No preview text added", "Aucun texte d’aperçu"],
  "İçerik ekleme ve yönetme": ["Create and manage content", "Créer et gérer le contenu"],
  "İngilizce ve Fransızca başlık ile yazı zorunlu.": ["English and French titles and article content are required.", "Les titres et contenus anglais et français sont obligatoires."],
  "İşleniyor…": ["Processing…", "Traitement…"], "Şifre hatalı": ["Incorrect password", "Mot de passe incorrect"],
  "Pt": ["Mon", "Lun"], "Sa": ["Tue", "Mar"], "Ça": ["Wed", "Mer"], "Pe": ["Thu", "Jeu"], "Cu": ["Fri", "Ven"], "Ct": ["Sat", "Sam"], "Pz": ["Sun", "Dim"],
  "görüntüleme": ["views", "vues"], "sayfa görüntüleme": ["page views", "pages vues"], "kişi": ["people", "personnes"],
  "önceki dönemde veri yok": ["no data for previous period", "aucune donnée pour la période précédente"],
  "Abone": ["Subscribers", "Abonnés"], "demo oran": ["demo rate", "taux de démonstration"],
  "gönderim yok": ["no sends", "aucun envoi"], "Planlı gönderim yok": ["No scheduled sends", "Aucun envoi planifié"],
  "Ziyaretçi akışında abonelik formunu gösterir.": ["Shows the subscription form in the visitor feed.", "Affiche le formulaire d’abonnement dans le fil public."],
  "Ana başlığın altında aktif abone sayısı görünür.": ["Shows the active subscriber count below the main heading.", "Affiche le nombre d’abonnés actifs sous le titre principal."],
  "Demo için saklanır; ziyaretçi sitesini kapatmaz.": ["Stored for demo purposes; it does not disable the visitor site.", "Conservé pour la démonstration ; ne désactive pas le site public."],
  "Kapalı modüller menüden kaldırılır.": ["Disabled modules are removed from the menu.", "Les modules désactivés sont retirés du menu."],
  "Bülten ve abone yönetimi": ["Newsletter and subscriber management", "Gestion des infolettres et des abonnés"],
  "Yerel demo analitik": ["Local demo analytics", "Statistiques locales de démonstration"],
  "Reklam demo veritabanına yazılır; Supabase kullanılmaz.": ["The ad is saved to the demo database; Supabase is not used.", "La publicité est enregistrée dans la base de démonstration ; Supabase n’est pas utilisé."],
  "Kapatırsanız reklam taslak olarak saklanır.": ["If disabled, the ad is saved as a draft.", "Si cette option est désactivée, la publicité est enregistrée comme brouillon."],
  "Uzun yazılar otomatik olarak birden fazla karta bölünür.": ["Long posts are automatically split across multiple cards.", "Les articles longs sont automatiquement répartis sur plusieurs cartes."],
  "Demo panel için yerel veritabanı kullanılır. Şifre site girişi ile aynıdır.": ["The demo panel uses a local database. The password is the same as the site login.", "Le panneau de démonstration utilise une base locale. Le mot de passe est identique à celui du site."],
  "Gönderilmiş bülten verisi oluştuğunda grafik burada görünecek.": ["The chart will appear here once sent-newsletter data is available.", "Le graphique apparaîtra ici lorsque des données d’infolettres envoyées seront disponibles."],
  "Açılma oranı": ["Open rate", "Taux d’ouverture"],
  "Reads": ["Reads", "Lectures"], "Date": ["Date", "Date"], "Delete": ["Delete", "Supprimer"],
  "Sort": ["Sort", "Trier"], "Name": ["Name", "Nom"], "Email": ["Email", "E-mail"],
  "Source": ["Source", "Source"], "Subject": ["Subject", "Objet"], "Card text": ["Card text", "Texte de la carte"],
  "Format": ["Format", "Format"], "Theme": ["Theme", "Thème"], "Reset": ["Reset", "Réinitialiser"],
  "Download all": ["Download all", "Tout télécharger"], "Top and sides": ["Top and sides", "Haut et côtés"],
  "Download PNG": ["Download PNG", "Télécharger le PNG"],
  "Active subscribers": ["Active subscribers", "Abonnés actifs"], "New ad": ["New ad", "Nouvelle publicité"],
  "Delete ad?": ["Delete ad?", "Supprimer la publicité ?"], "Delete page?": ["Delete page?", "Supprimer la page ?"],
  "Back to posts": ["Back to posts", "Retour aux articles"], "Page": ["Page", "Page"],
  "Unique readers": ["Unique readers", "Lecteurs uniques"], "Discover": ["Discover", "Découvrir"],
  "Germany": ["Germany", "Allemagne"],
  "Device breakdown": ["Device breakdown", "Répartition par appareil"],
  "Direct": ["Direct", "Accès direct"],
  "Other iPhone models": ["Other iPhone models", "Autres modèles d’iPhone"],
  "Other": ["Other", "Autres"],
  "Mon": ["Mon", "Lun"], "Tue": ["Tue", "Mar"], "Wed": ["Wed", "Mer"], "Thu": ["Thu", "Jeu"],
  "Fri": ["Fri", "Ven"], "Sat": ["Sat", "Sam"], "Sun": ["Sun", "Dim"],
  "Jan": ["Jan", "Janv"], "Feb": ["Feb", "Févr"], "Mar": ["Mar", "Mars"], "Apr": ["Apr", "Avr"],
  "May": ["May", "Mai"], "Jun": ["Jun", "Juin"], "Jul": ["Jul", "Juil"], "Aug": ["Aug", "Août"],
  "Sep": ["Sep", "Sept"], "Oct": ["Oct", "Oct"], "Nov": ["Nov", "Nov"], "Dec": ["Dec", "Déc"],
  "Demo ad. It can be displayed in the visitor feed.": ["Demo ad. It can be displayed in the visitor feed.", "Publicité de démonstration. Elle peut être affichée dans le fil public."],
  "Görsel yükle": ["Upload image", "Téléverser une image"], "Yükleniyor…": ["Uploading…", "Téléversement…"],
  "Kütüphaneden seç": ["Choose from library", "Choisir dans la médiathèque"], "Görsel kütüphanesi": ["Image library", "Médiathèque"],
  "Kütüphaneyi kapat": ["Close library", "Fermer la médiathèque"], "Görseller yükleniyor…": ["Loading images…", "Chargement des images…"],
  "Henüz görsel yok": ["No images yet", "Aucune image pour l’instant"], "Görsel yüklendi.": ["Image uploaded.", "Image téléversée."],
  "Görsel yükleyin veya kütüphaneden seçin.": ["Upload an image or choose one from the library.", "Téléversez une image ou choisissez-en une dans la médiathèque."],
  "Bir görsel dosyası seçin.": ["Choose an image file.", "Choisissez un fichier image."],
  "Görsel en fazla 8 MB olabilir.": ["The image must be 8 MB or smaller.", "L’image ne doit pas dépasser 8 Mo."],
  "Yalnızca JPG, PNG, WebP, GIF veya AVIF yüklenebilir.": ["Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.", "Seules les images JPG, PNG, WebP, GIF ou AVIF sont acceptées."],
  "Sunucu public/images/news klasörüne yazamıyor. Klasör izinlerini kontrol edin.": ["The server cannot write to public/images/news. Check the folder permissions.", "Le serveur ne peut pas écrire dans public/images/news. Vérifiez les droits du dossier."],
  "Yükleme başarısız.": ["Upload failed.", "Échec du téléversement."],
  "Yükleme başarısız. Dosya sunucu için fazla büyük olabilir.": ["Upload failed. The file may be too large for the server.", "Échec du téléversement. Le fichier est peut-être trop volumineux pour le serveur."],
  "Görseller yüklenemedi.": ["Images could not be loaded.", "Impossible de charger les images."],
};

const COPY = {
  ...TURKISH_COPY,
  ...Object.fromEntries(Object.values(TURKISH_COPY).map(([english, french]) => [english, [english, french]])),
};

const originals = new WeakMap();
const attributeOriginals = new WeakMap();
const attributes = ["placeholder", "aria-label", "title"];

function translate(value, language) {
  const index = language === "fr" ? 1 : 0;
  const trimmed = value.trim();
  if (COPY[trimmed]) return value.replace(trimmed, COPY[trimmed][index]);
  const replacements = language === "fr"
    ? [["Pazartesi", "Lundi"], ["Salı", "Mardi"], ["Çarşamba", "Mercredi"], ["Perşembe", "Jeudi"], ["Cuma", "Vendredi"], ["Cumartesi", "Samedi"], ["Pazar", "Dimanche"], ["Ocak", "Janvier"], ["Şubat", "Février"], ["Mart", "Mars"], ["Nisan", "Avril"], ["Mayıs", "Mai"], ["Haziran", "Juin"], ["Temmuz", "Juillet"], ["Ağustos", "Août"], ["Eylül", "Septembre"], ["Ekim", "Octobre"], ["Kasım", "Novembre"], ["Aralık", "Décembre"]]
    : [["Pazartesi", "Monday"], ["Salı", "Tuesday"], ["Çarşamba", "Wednesday"], ["Perşembe", "Thursday"], ["Cuma", "Friday"], ["Cumartesi", "Saturday"], ["Pazar", "Sunday"], ["Ocak", "January"], ["Şubat", "February"], ["Mart", "March"], ["Nisan", "April"], ["Mayıs", "May"], ["Haziran", "June"], ["Temmuz", "July"], ["Ağustos", "August"], ["Eylül", "September"], ["Ekim", "October"], ["Kasım", "November"], ["Aralık", "December"]];
  let output = value;
  for (const [source, target] of replacements) output = output.replaceAll(source, target);
  return output
    .replace(/(\d+) yazı/g, language === "fr" ? "$1 articles" : "$1 posts")
    .replace(/(\d+) reklam/g, language === "fr" ? "$1 publicités" : "$1 ads")
    .replace(/(\d+) özel sayfa/g, language === "fr" ? "$1 pages personnalisées" : "$1 custom pages")
    .replace(/(\d+) aktif abone/g, language === "fr" ? "$1 abonnés actifs" : "$1 active subscribers")
    .replace(/(\d+) sayı gönderildi/g, language === "fr" ? "$1 numéros envoyés" : "$1 issues sent")
    .replace(/(\d+) bekliyor/g, language === "fr" ? "$1 en attente" : "$1 pending")
    .replace(/(\d+) gönderim/g, language === "fr" ? "$1 envois" : "$1 sends")
    .replace(/(\d+) saat önce/g, language === "fr" ? "il y a $1 h" : "$1 hours ago")
    .replace(/(\d+) gün önce/g, language === "fr" ? "il y a $1 jours" : "$1 days ago")
    .replace(/bu hafta/g, language === "fr" ? "cette semaine" : "this week")
    .replace(/önceki döneme göre/g, language === "fr" ? "par rapport à la période précédente" : "vs previous period")
    .replace(/önizlemesi/g, language === "fr" ? "aperçu" : "preview")
    .replace(/ işlemleri/g, language === "fr" ? " — actions" : " actions")
    .replace(/ modülünü etkinleştir/g, language === "fr" ? " — activer le module" : " — enable module")
    .replace(/ yayını/g, language === "fr" ? " — publication" : " publishing")
    .replace(/ silinecek\./g, language === "fr" ? " sera supprimé." : " will be deleted.")
    .replace(/yerel veritabanı/g, language === "fr" ? "base locale" : "local database")
    .replace(/yayında/g, language === "fr" ? "publié" : "published")
    .replace(/(\d+) posts/g, language === "fr" ? "$1 articles" : "$1 posts")
    .replace(/(\d+) ads/g, language === "fr" ? "$1 publicités" : "$1 ads")
    .replace(/(\d+) custom pages/g, language === "fr" ? "$1 pages personnalisées" : "$1 custom pages")
    .replace(/(\d+) active subscribers/g, language === "fr" ? "$1 abonnés actifs" : "$1 active subscribers")
    .replace(/(\d+) issues sent/g, language === "fr" ? "$1 numéros envoyés" : "$1 issues sent")
    .replace(/(\d+) pending/g, language === "fr" ? "$1 en attente" : "$1 pending")
    .replace(/(\d+) sends/g, language === "fr" ? "$1 envois" : "$1 sends")
    .replace(/(\d+) hours ago/g, language === "fr" ? "il y a $1 h" : "$1 hours ago")
    .replace(/(\d+) days ago/g, language === "fr" ? "il y a $1 jours" : "$1 days ago")
    .replace(/^Low resolution: (\d+) px wide\. Cover images should be at least (\d+) px\.$/, language === "fr" ? "Basse résolution : $1 px de large. Les images de couverture doivent faire au moins $2 px." : "Low resolution: $1 px wide. Cover images should be at least $2 px.")
    .replace(/^(.+) is too long \(max (\d+) characters\)\.$/, language === "fr" ? "Le champ « $1 » est trop long (max $2 caractères)." : "$1 is too long (max $2 characters).")
    .replace(/(\d+) characters/g, language === "fr" ? "$1 caractères" : "$1 characters")
    .replace(/(\d+) images/g, language === "fr" ? "$1 images" : "$1 images")
    .replace(/(\d+) readers/g, language === "fr" ? "$1 lecteurs" : "$1 readers")
    .replace(/Last (\d+) days/g, language === "fr" ? "$1 derniers jours" : "Last $1 days")
    .replace(/Last (\d+) issues/g, language === "fr" ? "$1 derniers numéros" : "Last $1 issues")
    .replace(/published this week/g, language === "fr" ? "publiés cette semaine" : "published this week")
    .replace(/ will be deleted\./g, language === "fr" ? " sera supprimé." : " will be deleted.")
    .replace(/ actions/g, language === "fr" ? " — actions" : " actions");
}

function applyTranslations(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue?.trim() || node.parentElement?.closest("[contenteditable='true']")) continue;
    const original = originals.get(node) || node.nodeValue;
    originals.set(node, original);
    node.nodeValue = translate(original, language);
  }
  root.querySelectorAll?.("*").forEach((element) => {
    const saved = attributeOriginals.get(element) || {};
    for (const name of attributes) {
      if (!element.hasAttribute(name)) continue;
      const original = saved[name] || element.getAttribute(name);
      saved[name] = original;
      element.setAttribute(name, translate(original, language));
    }
    attributeOriginals.set(element, saved);
  });
}

export function AdminTranslations() {
  const { language } = useLanguage();
  useEffect(() => {
    const root = document.querySelector(".admin-root");
    if (!root) return;
    let observer;
    const timer = window.setTimeout(() => {
      applyTranslations(root, language);
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) applyTranslations(node, language);
          }
        }
      });
      observer.observe(root, { childList: true, subtree: true });
    }, 500);
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [language]);
  return null;
}
