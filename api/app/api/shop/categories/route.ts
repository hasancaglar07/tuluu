import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import ShopCategory from "@/models/ShopCategory";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * /api/shop/categories:
 *   get:
 *     summary: Get all active shop categories
 *     description: |
 *       Retrieves all active shop categories with their metadata including
 *       item counts, colors, icons, and sort order. This endpoint provides
 *       the category structure needed for organizing shop items in the frontend.
 *       Categories are returned sorted by their sort order. Requires user authentication.
 *     tags:
 *       - Shop
 *       - Categories
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved shop categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *             examples:
 *               categoriesData:
 *                 summary: Complete categories data
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "507f1f77bcf86cd799439021"
 *                       name: "Gems"
 *                       description: "Premium currency for unlocking content and features"
 *                       color: "#3B82F6"
 *                       icon: "💎"
 *                       itemCount: 8
 *                       sortOrder: 1
 *                     - id: "507f1f77bcf86cd799439022"
 *                       name: "Hearts"
 *                       description: "Lives for continuing your learning journey"
 *                       color: "#EF4444"
 *                       icon: "❤️"
 *                       itemCount: 3
 *                       sortOrder: 2
 *                     - id: "507f1f77bcf86cd799439023"
 *                       name: "Power-ups"
 *                       description: "Special abilities to enhance your learning"
 *                       color: "#10B981"
 *                       icon: "⚡"
 *                       itemCount: 5
 *                       sortOrder: 3
 *                     - id: "507f1f77bcf86cd799439024"
 *                       name: "Cosmetics"
 *                       description: "Customize your avatar and profile"
 *                       color: "#8B5CF6"
 *                       icon: "🎨"
 *                       itemCount: 12
 *                       sortOrder: 4
 *                     - id: "507f1f77bcf86cd799439025"
 *                       name: "Subscriptions"
 *                       description: "Premium memberships and recurring benefits"
 *                       color: "#F59E0B"
 *                       icon: "👑"
 *                       itemCount: 2
 *                       sortOrder: 5
 *               emptyCategories:
 *                 summary: No categories available
 *                 value:
 *                   success: true
 *                   data: []
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to fetch categories"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShopCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the category
 *           example: "507f1f77bcf86cd799439021"
 *         name:
 *           type: string
 *           description: Display name of the category
 *           example: "Gems"
 *         description:
 *           type: string
 *           description: Detailed description of what the category contains
 *           example: "Premium currency for unlocking content and features"
 *         color:
 *           type: string
 *           pattern: "^#[0-9A-Fa-f]{6}$"
 *           description: Hex color code for category theming
 *           example: "#3B82F6"
 *         icon:
 *           type: string
 *           description: Emoji or icon representing the category
 *           example: "💎"
 *         itemCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of active items in this category
 *           example: 8
 *         sortOrder:
 *           type: integer
 *           minimum: 1
 *           description: Order for displaying categories (lower numbers first)
 *           example: 1
 *
 *     CategoriesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShopCategory'
 *           description: Array of shop categories
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Failed to fetch categories"
 *
 *   examples:
 *     ShopCategoriesApiUsageExample:
 *       summary: How to use the Shop Categories API with Axios
 *       description: |
 *         **Step 1: Fetch Categories with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchShopCategories = async () => {
 *           try {
 *             const response = await axios.get('/api/shop/categories', {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to fetch categories');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch shop categories:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const categories = await fetchShopCategories();
 *         console.log('Available categories:', categories);
 *         ```
 *
 *         **Step 2: Process and Display Categories**
 *         ```javascript
 *         const displayCategories = async () => {
 *           try {
 *             const categories = await fetchShopCategories();
 *
 *             // Sort categories by sortOrder (already sorted from API)
 *             const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder);
 *
 *             // Display category information
 *             console.log('Shop Categories:');
 *             sortedCategories.forEach((category, index) => {
 *               console.log(`${index + 1}. ${category.icon} ${category.name}`);
 *               console.log(`   Description: ${category.description}`);
 *               console.log(`   Items: ${category.itemCount}`);
 *               console.log(`   Color: ${category.color}`);
 *               console.log('');
 *             });
 *
 *             // Find categories with most items
 *             const popularCategories = categories
 *               .filter(cat => cat.itemCount > 0)
 *               .sort((a, b) => b.itemCount - a.itemCount)
 *               .slice(0, 3);
 *
 *             console.log('Most popular categories:');
 *             popularCategories.forEach(cat => {
 *               console.log(`- ${cat.name}: ${cat.itemCount} items`);
 *             });
 *
 *             return categories;
 *           } catch (error) {
 *             console.error('Error displaying categories:', error);
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create a Categories Service**
 *         ```javascript
 *         class CategoriesService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/shop',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.categories = null;
 *             this.lastFetch = null;
 *             this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
 *           }
 *
 *           setupInterceptors() {
 *             this.client.interceptors.request.use(
 *               (config) => {
 *                 const token = localStorage.getItem('authToken');
 *                 if (token) {
 *                   config.headers.Authorization = `Bearer ${token}`;
 *                 }
 *                 return config;
 *               }
 *             );
 *
 *             this.client.interceptors.response.use(
 *               (response) => response,
 *               (error) => {
 *                 if (error.response?.status === 401) {
 *                   this.handleUnauthorized();
 *                 }
 *                 return Promise.reject(error);
 *               }
 *             );
 *           }
 *
 *           handleUnauthorized() {
 *             localStorage.removeItem('authToken');
 *             window.location.href = '/login';
 *           }
 *
 *           async getCategories(forceRefresh = false) {
 *             // Return cached categories if available and not expired
 *             if (!forceRefresh && this.categories && this.lastFetch) {
 *               const timeSinceLastFetch = Date.now() - this.lastFetch;
 *               if (timeSinceLastFetch < this.cacheTimeout) {
 *                 return this.categories;
 *               }
 *             }
 *
 *             try {
 *               const response = await this.client.get('/categories');
 *
 *               if (response.data.success) {
 *                 this.categories = response.data.data;
 *                 this.lastFetch = Date.now();
 *                 return this.categories;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to fetch categories');
 *               }
 *             } catch (error) {
 *               console.error('Categories fetch error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getCategoryById(categoryId) {
 *             const categories = await this.getCategories();
 *             return categories.find(cat => cat.id === categoryId);
 *           }
 *
 *           async getCategoryByName(categoryName) {
 *             const categories = await this.getCategories();
 *             return categories.find(cat =>
 *               cat.name.toLowerCase() === categoryName.toLowerCase()
 *             );
 *           }
 *
 *           async getCategoriesWithItems() {
 *             const categories = await this.getCategories();
 *             return categories.filter(cat => cat.itemCount > 0);
 *           }
 *
 *           async getPopularCategories(limit = 5) {
 *             const categories = await this.getCategories();
 *             return categories
 *               .filter(cat => cat.itemCount > 0)
 *               .sort((a, b) => b.itemCount - a.itemCount)
 *               .slice(0, limit);
 *           }
 *
 *           async getCategoryColors() {
 *             const categories = await this.getCategories();
 *             return categories.reduce((colors, cat) => {
 *               colors[cat.name.toLowerCase()] = cat.color;
 *               return colors;
 *             }, {});
 *           }
 *
 *           async getCategoryIcons() {
 *             const categories = await this.getCategories();
 *             return categories.reduce((icons, cat) => {
 *               icons[cat.name.toLowerCase()] = cat.icon;
 *               return icons;
 *             }, {});
 *           }
 *
 *           // Helper methods
 *           formatCategoryForDisplay(category) {
 *             return {
 *               ...category,
 *               displayName: `${category.icon} ${category.name}`,
 *               hasItems: category.itemCount > 0,
 *               isEmpty: category.itemCount === 0
 *             };
 *           }
 *
 *           generateCategoryNavigation() {
 *             return this.getCategories().then(categories => {
 *               return [
 *                 {
 *                   id: 'all',
 *                   name: 'All Items',
 *                   icon: '🛍️',
 *                   color: '#6B7280',
 *                   itemCount: categories.reduce((sum, cat) => sum + cat.itemCount, 0)
 *                 },
 *                 ...categories.filter(cat => cat.itemCount > 0)
 *               ];
 *             });
 *           }
 *
 *           clearCache() {
 *             this.categories = null;
 *             this.lastFetch = null;
 *           }
 *         }
 *
 *         export const categoriesService = new CategoriesService();
 *         ```
 *
 *     ReactCategoriesComponentExample:
 *       summary: React component for category navigation
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import axios from 'axios';
 *
 *         interface Category {
 *           id: string;
 *           name: string;
 *           description: string;
 *           color: string;
 *           icon: string;
 *           itemCount: number;
 *           sortOrder: number;
 *         }
 *
 *         interface CategoryNavigationProps {
 *           selectedCategory?: string;
 *           onCategorySelect: (categoryId: string) => void;
 *           showItemCounts?: boolean;
 *           showAllOption?: boolean;
 *         }
 *
 *         export function CategoryNavigation({
 *           selectedCategory = 'all',
 *           onCategorySelect,
 *           showItemCounts = true,
 *           showAllOption = true
 *         }: CategoryNavigationProps) {
 *           const [categories, setCategories] = useState<Category[]>([]);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           useEffect(() => {
 *             fetchCategories();
 *           }, []);
 *
 *           const fetchCategories = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get('/api/shop/categories');
 *
 *               if (response.data.success) {
 *                 setCategories(response.data.data);
 *               } else {
 *                 setError(response.data.error || 'Failed to fetch categories');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 401) {
 *                   setError('Please log in to view categories');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to fetch categories');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const getTotalItems = () => {
 *             return categories.reduce((sum, cat) => sum + cat.itemCount, 0);
 *           };
 *
 *           const getAvailableCategories = () => {
 *             return categories.filter(cat => cat.itemCount > 0);
 *           };
 *
 *           if (loading) {
 *             return <div className="category-loading">Loading categories...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="category-error">
 *                 <p>Error: {error}</p>
 *                 <button onClick={fetchCategories} className="retry-button">
 *                   Retry
 *                 </button>
 *               </div>
 *             );
 *           }
 *
 *           const availableCategories = getAvailableCategories();
 *
 *           return (
 *             <div className="category-navigation">
 *               <div className="category-buttons">
 *                 {showAllOption && (
 *                   <button
 *                     className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
 *                     onClick={() => onCategorySelect('all')}
 *                   >
 *                     <span className="category-icon">🛍️</span>
 *                     <span className="category-name">All Items</span>
 *                     {showItemCounts && (
 *                       <span className="item-count">({getTotalItems()})</span>
 *                     )}
 *                   </button>
 *                 )}
 *
 *                 {availableCategories.map((category) => (
 *                   <button
 *                     key={category.id}
 *                     className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
 *                     onClick={() => onCategorySelect(category.id)}
 *                     style={{
 *                       '--category-color': category.color,
 *                       backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
 *                       borderColor: category.color,
 *                       color: selectedCategory === category.id ? 'white' : category.color
 *                     } as React.CSSProperties}
 *                     title={category.description}
 *                   >
 *                     <span className="category-icon">{category.icon}</span>
 *                     <span className="category-name">{category.name}</span>
 *                     {showItemCounts && (
 *                       <span className="item-count">({category.itemCount})</span>
 *                     )}
 *                   </button>
 *                 ))}
 *               </div>
 *
 *               {categories.length === 0 && (
 *                 <div className="no-categories">
 *                   <p>No categories available</p>
 *                 </div>
 *               )}
 *
 *               {availableCategories.length === 0 && categories.length > 0 && (
 *                 <div className="empty-categories">
 *                   <p>No categories have items available</p>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *
 *         // Category grid component for better visual display
 *         export function CategoryGrid({ onCategorySelect }: { onCategorySelect: (categoryId: string) => void }) {
 *           const [categories, setCategories] = useState<Category[]>([]);
 *           const [loading, setLoading] = useState(true);
 *
 *           useEffect(() => {
 *             fetchCategories();
 *           }, []);
 *
 *           const fetchCategories = async () => {
 *             try {
 *               const response = await axios.get('/api/shop/categories');
 *               if (response.data.success) {
 *                 setCategories(response.data.data.filter(cat => cat.itemCount > 0));
 *               }
 *             } catch (error) {
 *               console.error('Failed to fetch categories:', error);
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           if (loading) {
 *             return <div className="category-grid-loading">Loading...</div>;
 *           }
 *
 *           return (
 *             <div className="category-grid">
 *               {categories.map((category) => (
 *                 <div
 *                   key={category.id}
 *                   className="category-card"
 *                   onClick={() => onCategorySelect(category.id)}
 *                   style={{ borderColor: category.color }}
 *                 >
 *                   <div
 *                     className="category-header"
 *                     style={{ backgroundColor: category.color }}
 *                   >
 *                     <span className="category-icon-large">{category.icon}</span>
 *                   </div>
 *                   <div className="category-content">
 *                     <h3 className="category-title">{category.name}</h3>
 *                     <p className="category-description">{category.description}</p>
 *                     <div className="category-stats">
 *                       <span className="item-count">{category.itemCount} items</span>
 *                     </div>
 *                   </div>
 *                 </div>
 *               ))}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Categories
 *     description: Operations for managing and retrieving shop categories
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const categories = await ShopCategory.getActiveCategories();

    const transformedCategories = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      itemCount: cat.itemCount,
      sortOrder: cat.sortOrder,
    }));

    return NextResponse.json({
      success: true,
      data: transformedCategories,
    });
  } catch (error) {
    console.error("Shop Categories API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}
