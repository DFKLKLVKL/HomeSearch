using Microsoft.EntityFrameworkCore;
using HomeSearch.Api.Models;

namespace HomeSearch.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Уникальный email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Составной уникальный ключ для избранного (один пользователь - одно объявление)
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.PropertyId })
                .IsUnique();

            // Каскадное удаление: если пользователь удален, удалить его объявления
            modelBuilder.Entity<Property>()
                .HasOne(p => p.Owner)
                .WithMany(u => u.Properties)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Каскадное удаление: если объявление удалено, удалить его брони
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Property)
                .WithMany(p => p.Bookings)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}