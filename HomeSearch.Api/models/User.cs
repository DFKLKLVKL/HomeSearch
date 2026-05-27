using System.ComponentModel.DataAnnotations;

namespace HomeSearch.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public DateTime? BirthDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Навигационные свойства
        public ICollection<Property> Properties { get; set; } = new List<Property>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    }
}