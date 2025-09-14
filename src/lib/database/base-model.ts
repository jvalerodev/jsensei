// Base model class with common database operations
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, QueryOptions, PaginatedResult } from './types';

export abstract class BaseModel<T, CreateData, UpdateData> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw this.handleError(error);
      }

      return data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.handleError(error);
      }

      const totalCount = count || 0;
      const hasMore = options.limit ? 
        (options.offset || 0) + (options.limit || 0) < totalCount : 
        false;

      return {
        data: (data || []) as T[],
        count: totalCount,
        hasMore
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateData): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw this.handleError(error);
      }

      return result as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create multiple records
   */
  async createMany(data: CreateData[]): Promise<T[]> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select();

      if (error) {
        throw this.handleError(error);
      }

      return (result || []) as T[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateData): Promise<T | null> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw this.handleError(error);
      }

      return result as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw this.handleError(error);
      }

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) {
        throw this.handleError(error);
      }

      return count || 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.findById(id);
      return record !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find records with custom query builder
   */
  protected async executeQuery(
    queryBuilder: (query: any) => any
  ): Promise<any> {
    try {
      const baseQuery = this.supabase.from(this.tableName).select('*');
      const query = queryBuilder(baseQuery);
      const { data, error } = await query;

      if (error) {
        throw this.handleError(error);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(error: any): DatabaseError {
    console.error(`Database error in ${this.tableName}:`, error);
    
    return {
      message: error.message || 'Database operation failed',
      code: error.code,
      details: error.details || error
    };
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Sanitize data before database operations
   */
  protected sanitizeData(data: any): any {
    const sanitized = { ...data };
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }
}
