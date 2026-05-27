namespace HomeSearch.Api.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Message { get; set; }
        public string Status { get; set; } = "pending"; // pending, confirmed, cancelled, completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Внешние ключи
        public int GuestId { get; set; }
        public int PropertyId { get; set; }
        
        // Навигационные свойства
        public User Guest { get; set; } = null!;
        public Property Property { get; set; } = null!;
    }
}