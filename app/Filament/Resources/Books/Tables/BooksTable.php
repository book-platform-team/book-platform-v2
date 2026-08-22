<?php

namespace App\Filament\Resources\Books\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BooksTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('author_id')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('category_id')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('slug')
                    ->searchable(),
                TextColumn::make('cover')
                    ->searchable(),
                TextColumn::make('language')
                    ->searchable(),
                TextColumn::make('pages')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('publication_year')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('edition')
                    ->searchable(),
                TextColumn::make('isbn')
                    ->searchable(),
                TextColumn::make('legal_deposit')
                    ->searchable(),
                TextColumn::make('publication_type')
                    ->searchable(),
                TextColumn::make('price_digital')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('price_print')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('price_2')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('price_3')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('price_4')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('sale_email')
                    ->searchable(),
                TextColumn::make('status')
                    ->searchable(),
                TextColumn::make('published_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('downloads_count')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('views_count')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
