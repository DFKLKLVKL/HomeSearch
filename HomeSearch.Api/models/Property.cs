using System.ComponentModel.DataAnnotations;

namespace HomeSearch.Api.Models
{
    public class Property
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public string? Type { get; set; } // apartment, house, cottage...
        public decimal PricePerNight { get; set; }
        public int Guests { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Rules { get; set; }
        public string? Amenities { get; set; } // Можно хранить как JSON строку: ["wifi", "parking"]
        public string? Photos { get; set; } // JSON массив ссылок на фото
        public string Status { get; set; } = "pending"; // pending, active, archived
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Внешний ключ
        public int OwnerId { get; set; }
        
        // Навигационные свойства
        public User Owner { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Favorite> FavoritedByUsers { get; set; } = new List<Favorite>();
    }
}